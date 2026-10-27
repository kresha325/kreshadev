import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const children = [
  spawn("pnpm", ["--filter", "@workspace/api-server", "run", "dev"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: process.env.PORT ?? "3001",
      PORTFOLIO_ORIGIN: process.env.PORTFOLIO_ORIGIN ?? "http://localhost:5173",
      NODE_ENV: "development",
    },
    stdio: "inherit",
  }),
  spawn("pnpm", ["--filter", "@workspace/portfolio", "run", "dev"], {
    cwd: root,
    env: { ...process.env, PORT: "5173", API_URL: "http://127.0.0.1:3001" },
    stdio: "inherit",
  }),
];

let stopping = false;
function stop(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (child.exitCode === null) child.kill(signal);
}

process.on("SIGINT", () => stop("SIGINT"));
process.on("SIGTERM", () => stop("SIGTERM"));
for (const child of children) child.on("exit", (code) => {
  if (!stopping && code !== 0) stop();
});
