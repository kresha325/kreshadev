# KreshaDev Portfolio

Personal portfolio built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

```sh
pnpm install
pnpm run dev:portfolio
```

If `.env` is missing in a fresh checkout, copy `.env.example` to `.env` and set a unique `ADMIN_PASSWORD` plus an `ADMIN_SESSION_SECRET` of at least 32 characters. Keep `.env` private. Open the portfolio at `http://localhost:5173` and the project manager at `http://localhost:5173/admin`.

Projects, uploaded images, and contact inquiries are stored in `artifacts/api-server/data` by default. The admin supports up to 10 photos or logos per project; images are converted to WebP and limited to 750 KB each. Project inquiries submitted from the contact form appear in the protected admin inbox when the API is enabled.

## GitHub Pages (static portfolio)

The `main` branch includes a GitHub Actions workflow that builds and publishes the static portfolio from `artifacts/portfolio`. It includes the selected project images and directs project inquiries to WhatsApp. The static edition does not enable project editing in `/admin`; that requires the API and will be added in a later full-stack deployment.

For this repository, the workflow builds with the `/kreshadev/` base path. In GitHub, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Every push to `main` then builds and deploys the site.

## Full-stack deployment (later)

Build the static portfolio and API server in order with `pnpm run build:portfolio-app`, then run the API server with `NODE_ENV=production`, `PORT`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` set. The API server serves the built portfolio on the same origin. Configure `PORTFOLIO_DATA_DIR` to a persistent writable disk on the host, or project changes and uploaded images will be lost when an ephemeral instance is replaced. Use HTTPS in production.

The portfolio is in `artifacts/portfolio`. Selected work links to public GitHub repositories owned by [kresha325](https://github.com/kresha325).
