import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";
import { uploadsDirectory } from "./lib/project-store";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/uploads", express.static(uploadsDirectory, { immutable: true, maxAge: "1y" }));

const portfolioDirectory = process.env.PORTFOLIO_STATIC_DIR
  ? path.resolve(process.env.PORTFOLIO_STATIC_DIR)
  : path.resolve(__dirname, "../../portfolio/dist/public");
app.use(express.static(portfolioDirectory, { index: "index.html" }));
app.use((request, response, next) => {
  if (request.method !== "GET" || request.path === "/api" || request.path.startsWith("/api/")) {
    next();
    return;
  }
  response.sendFile(path.join(portfolioDirectory, "index.html"), (error) => {
    if (error) next(error);
  });
});

export default app;
