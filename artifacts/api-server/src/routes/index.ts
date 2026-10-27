import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import adminRouter from "./admin";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/contact", contactRouter);
router.use("/admin", adminRouter);

export default router;
