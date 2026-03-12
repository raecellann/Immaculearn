/* eslint no-restricted-globals: ["error", "event"] */
/* global process */

import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";

const IS_PRODUCTION = process.env.ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createCustomServer() {
  const app = express();
  const server = createServer(app);

  let vite;

  // Proxy API requests to the backend
  const apiTarget = IS_PRODUCTION ? process.env.API_URL : "http://localhost:3000";

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
    })
  );

  let clientDistPath;

  if (IS_PRODUCTION) {
    // Try common production build folders
    const possiblePaths = ["dist/client", "build"];
    clientDistPath = possiblePaths
      .map((p) => path.resolve(__dirname, p))
      .find((p) => fs.existsSync(p));

    if (!clientDistPath) {
      throw new Error(
        "Cannot find frontend build folder! Make sure you ran the frontend build."
      );
    }

    app.use(express.static(clientDistPath, { index: false }));
  } else {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      build: {
        ssr: true,
        ssrEmitAssets: true,
      },
    });

    app.use(vite.middlewares);
    clientDistPath = __dirname; // In dev, serve index.html from root
  }

  // Ignore well-known paths
  app.use((req, res, next) => {
    if (req.path.startsWith("/.well-known")) {
      return res.status(404).end();
    }
    next();
  });

  // SSR handler
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const indexPath = path.join(clientDistPath, "index.html");
      const index = fs.readFileSync(indexPath, "utf-8");

      let render, template;

      if (IS_PRODUCTION) {
        template = index;
        render = await import(path.join(__dirname, "dist/server/server-entry.js")).then(
          (mod) => mod.render
        );
      } else {
        template = await vite.transformIndexHtml(url, index);
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

  server.listen(process.env.PORT, "::", () => {
    console.log(`Server listening on port ${process.env.PORT}`);
  });
}

createCustomServer();