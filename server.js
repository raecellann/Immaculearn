/* server.js */
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createCustomServer() {
  const app = express();
  const server = createServer(app);

  // API proxy
  const apiTarget = IS_PRODUCTION
    ? process.env.API_URL
    : "http://localhost:3000";
  app.use("/v1", (req, res, next) => {
    if (req.headers["x-requested-with"] !== "XMLHttpRequest") {
      return res.status(403).json({ success: false, message: "Forbidden. 🙂" });
    }
    next();
  });
  app.use(
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      pathFilter: "/v1",
      cookieDomainRewrite: "",
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader("apikey", process.env.API_KEY);
        },
      },
    }),
  );

  // Vite dev vs production
  let vite;
  if (!IS_PRODUCTION) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      build: { ssr: true, ssrEmitAssets: true },
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, "./dist/client"), {
        index: false,
      }),
    );
  }

  // SSR handler
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const indexHtml = fs.readFileSync(
        path.resolve(
          __dirname,
          IS_PRODUCTION ? "./dist/client/index.html" : "./index.html",
        ),
        "utf-8",
      );

      let template = indexHtml;
      let render;

      if (IS_PRODUCTION) {
        const serverEntryPath = path.resolve(
          __dirname,
          "./dist/server/server-entry.js",
        );
        render = await import(serverEntryPath).then((mod) => mod.render);
      } else {
        template = await vite.transformIndexHtml(url, indexHtml);
        render = (await vite.ssrLoadModule("/src/server-entry.jsx")).render;
      }

      const context = {};
      const appHtml = render(url, context);
      const html = template.replace("<!-- ssr -->", appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      next(e);
    }
  });

  const PORT = process.env.PORT || 5173;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

createCustomServer();
