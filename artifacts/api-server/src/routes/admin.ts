import { randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { Router, type IRouter, type Request } from "express";
import { readContactMessages } from "../lib/contact-store";
import {
  authenticateAdmin,
  checkSameOrigin,
  clearAdminCookie,
  createAdminCookie,
  isAdminConfigured,
  hasAdminSession,
  loginAdmin,
} from "../lib/admin-auth";
import {
  readProjects,
  removeUnusedImages,
  uploadsDirectory,
  writeProjects,
  type PortfolioProject,
  type ProjectImage,
} from "../lib/project-store";

const router: IRouter = Router();
const projectRouter: IRouter = Router();
const maxImageBytes = 750 * 1024;
const maxImageTotalBytes = 8 * 1024 * 1024;
const allowedImageUrl = /^\/uploads\/[a-f0-9-]{36}\.webp$/;

router.get("/session", (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.json({ configured: isAdminConfigured(), authenticated: isAdminConfigured() && hasAdminSession(request) });
});

router.post("/login", (request, response) => {
  if (!checkSameOrigin(request)) {
    response.status(403).json({ error: "Requests must come from this site." });
    return;
  }
  if (!isAdminConfigured()) {
    response.status(503).json({ error: "Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET on the server." });
    return;
  }
  const password = request.body?.password;
  if (typeof password !== "string" || password.length > 200 || !loginAdmin(request, password)) {
    response.status(401).json({ error: "The password is incorrect or the login is temporarily locked. Try again in 15 minutes." });
    return;
  }
  response.setHeader("Set-Cookie", createAdminCookie());
  response.json({ authenticated: true });
});

router.post("/logout", (request, response) => {
  if (!checkSameOrigin(request)) {
    response.status(403).json({ error: "Requests must come from this site." });
    return;
  }
  response.setHeader("Set-Cookie", clearAdminCookie());
  response.json({ authenticated: false });
});

router.use("/projects", authenticateAdmin, projectRouter);

router.get("/messages", authenticateAdmin, async (_request, response, next) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json(await readContactMessages());
  } catch (error) {
    next(error);
  }
});

projectRouter.post("/", async (request, response, next) => {
  try {
    if (!checkSameOrigin(request)) {
      response.status(403).json({ error: "Requests must come from this site." });
      return;
    }
    const projects = await readProjects();
    const project = await buildProject(request, randomUUID());
    projects.push(project);
    await writeProjects(projects);
    await removeUnusedImages(projects);
    response.status(201).json(project);
  } catch (error) {
    if (error instanceof ProjectInputError) {
      response.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

projectRouter.put("/:id", async (request, response, next) => {
  try {
    if (!checkSameOrigin(request)) {
      response.status(403).json({ error: "Requests must come from this site." });
      return;
    }
    const projects = await readProjects();
    const index = projects.findIndex((project) => project.id === request.params.id);
    if (index < 0) {
      response.status(404).json({ error: "Project not found." });
      return;
    }
    const project = await buildProject(request, projects[index].id);
    projects[index] = project;
    await writeProjects(projects);
    await removeUnusedImages(projects);
    response.json(project);
  } catch (error) {
    if (error instanceof ProjectInputError) {
      response.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
});

projectRouter.delete("/:id", async (request, response, next) => {
  try {
    if (!checkSameOrigin(request)) {
      response.status(403).json({ error: "Requests must come from this site." });
      return;
    }
    const projects = await readProjects();
    const filtered = projects.filter((project) => project.id !== request.params.id);
    if (filtered.length === projects.length) {
      response.status(404).json({ error: "Project not found." });
      return;
    }
    await writeProjects(filtered);
    await removeUnusedImages(filtered);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

class ProjectInputError extends Error {}

function stringField(value: unknown, field: string, max: number, required = false) {
  if (typeof value !== "string") {
    if (!required && (value === undefined || value === null)) return "";
    throw new ProjectInputError(`${field} must be text.`);
  }
  const cleaned = value.trim();
  if (required && !cleaned) throw new ProjectInputError(`${field} is required.`);
  if (cleaned.length > max) throw new ProjectInputError(`${field} must be ${max} characters or fewer.`);
  return cleaned;
}

function validLink(value: string, field: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid protocol");
    return url.toString();
  } catch {
    throw new ProjectInputError(`${field} must be a valid http or https link.`);
  }
}

async function buildProject(request: Request, id: string): Promise<PortfolioProject> {
  const body = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ProjectInputError("Project data is missing.");
  const title = stringField(body.title, "Title", 120, true);
  const category = stringField(body.category, "Category", 100, true);
  const description = stringField(body.description, "Description", 3000, true);
  const href = validLink(stringField(body.href, "Project link", 2048), "Project link");
  const source = validLink(stringField(body.source, "Source link", 2048), "Source link");
  const status = stringField(body.status, "Status", 60);
  if (!Array.isArray(body.stack) || body.stack.length > 20 || body.stack.some((value: unknown) => typeof value !== "string")) {
    throw new ProjectInputError("Add up to 20 technology or feature tags.");
  }
  const stack = body.stack.map((value: string) => value.trim()).filter(Boolean);
  if (stack.some((value: string) => value.length > 50)) throw new ProjectInputError("Each tag must be 50 characters or fewer.");
  if (!Array.isArray(body.images) || body.images.length > 10) throw new ProjectInputError("Each project can have up to 10 images.");

  const newImages: Array<{ index: number; name: string; alt: string; fit: "cover" | "contain"; bytes: Buffer }> = [];
  const images: Array<ProjectImage | undefined> = [];
  let totalBytes = 0;
  for (const [index, image] of body.images.entries()) {
    if (!image || typeof image !== "object") throw new ProjectInputError("Invalid image entry.");
    const alt = stringField(image.alt, "Image description", 180);
    const fit = image.fit === "contain" ? "contain" : "cover";
    if (typeof image.url === "string") {
      if (!allowedImageUrl.test(image.url)) throw new ProjectInputError("Project images must be uploaded through this admin panel.");
      images[index] = { url: image.url, alt, fit };
      continue;
    }
    if (typeof image.data !== "string" || image.data.length > Math.ceil(maxImageBytes * 4 / 3) + 8) {
      throw new ProjectInputError("Each image must be 750 KB or smaller after compression.");
    }
    const bytes = Buffer.from(image.data, "base64");
    if (bytes.length === 0 || bytes.length > maxImageBytes || bytes.toString("base64") !== image.data ||
      bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
      throw new ProjectInputError("Images must be valid WebP files no larger than 750 KB. Please reselect the image.");
    }
    totalBytes += bytes.length;
    if (totalBytes > maxImageTotalBytes) throw new ProjectInputError("All images together must be 8 MB or smaller.");
    const name = `${randomUUID()}.webp`;
    newImages.push({ index, name, alt, fit, bytes });
  }

  const uploaded: string[] = [];
  try {
    for (const { index, name, alt, fit, bytes } of newImages) {
      await writeFile(path.join(uploadsDirectory, name), bytes, { flag: "wx" });
      uploaded.push(name);
      images[index] = { url: `/uploads/${name}`, alt, fit };
    }
  } catch (error) {
    await Promise.all(uploaded.map((name) => rm(path.join(uploadsDirectory, name), { force: true })));
    throw error;
  }

  return { id, title, category, description, stack, href, source, status, images: images as ProjectImage[] };
}

export default router;
