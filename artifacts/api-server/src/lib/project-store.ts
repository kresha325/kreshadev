import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ProjectImage = { url: string; alt: string; fit: "cover" | "contain" };

export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  stack: string[];
  href: string;
  source: string;
  status: string;
  images: ProjectImage[];
};

export const dataDirectory = process.env.PORTFOLIO_DATA_DIR
  ? path.resolve(process.env.PORTFOLIO_DATA_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
export const uploadsDirectory = path.join(dataDirectory, "uploads");
const projectsFile = path.join(dataDirectory, "projects.json");
const seedFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "data/initial-projects.json");

let writeQueue: Promise<unknown> = Promise.resolve();

export async function initializeProjectStore() {
  await mkdir(uploadsDirectory, { recursive: true });
  try {
    await readFile(projectsFile, "utf8");
  } catch {
    const seed = await readFile(seedFile, "utf8");
    await writeFile(projectsFile, seed, { encoding: "utf8", flag: "wx" }).catch(async (error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
    });
  }
}

export async function readProjects(): Promise<PortfolioProject[]> {
  await initializeProjectStore();
  return JSON.parse(await readFile(projectsFile, "utf8")) as PortfolioProject[];
}

export async function writeProjects(projects: PortfolioProject[]) {
  await initializeProjectStore();
  const nextWrite = writeQueue.then(async () => {
    const temporaryFile = `${projectsFile}.${randomUUID()}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(projects, null, 2), "utf8");
    await rename(temporaryFile, projectsFile);
  });
  writeQueue = nextWrite.catch(() => undefined);
  await nextWrite;
}

export async function removeUnusedImages(projects: PortfolioProject[]) {
  const used = new Set(projects.flatMap((project) => project.images.map((image) => image.url)));
  const { readdir } = await import("node:fs/promises");
  const names = await readdir(uploadsDirectory).catch(() => []);
  await Promise.all(
    names
      .filter((name) => name.endsWith(".webp") && !used.has(`/uploads/${name}`))
      .map((name) => rm(path.join(uploadsDirectory, name), { force: true })),
  );
}
