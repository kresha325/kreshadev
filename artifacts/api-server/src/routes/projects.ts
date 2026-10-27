import { Router, type IRouter } from "express";
import { readProjects } from "../lib/project-store";

const router: IRouter = Router();

router.get("/", async (_request, response, next) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json(await readProjects());
  } catch (error) {
    next(error);
  }
});

export default router;
