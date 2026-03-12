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

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

async function createCustomServer() {
  const app = express();
  const server = createServer(app);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      environment: IS_PRODUCTION ? "production" : "development",
    });
  });

  // IMPORTANT: In production, API requests should go to the same server
  // since both frontend and backend are running on the same instance
  const apiTarget = IS_PRODUCTION
    ? process.env.API_URL
    : "http://localhost:3000";

  console.log(`🌐 API Target: ${apiTarget}`);
  console.log(
    `🔧 Environment: ${IS_PRODUCTION ? "production" : "development"}`,
  );

  // Remove the XHR header check or make it optional
  app.use("/v1", (req, res, next) => {
    console.log(`🔄 API Request received: ${req.method} ${req.url}`);
    // Don't block requests without XHR header in production
    next();
  });

  // Proxy /v1 requests to the API
  app.use(
    "/v1",
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      cookieDomainRewrite: "",
      pathRewrite: {
        "^/v1": "/v1", // Keep the /v1 prefix
      },
      onProxyReq: (proxyReq, req, res) => {
        if (process.env.API_KEY) {
          proxyReq.setHeader("apikey", process.env.API_KEY);
        }
        console.log(
          `✅ Proxied: ${req.method} ${req.url} -> ${apiTarget}${req.url}`,
        );
      },
      onError: (err, req, res) => {
        console.error("❌ Proxy error:", err);
        res.status(500).json({ error: "Proxy error", message: err.message });
      },
    }),
  );

  // If in production and this is an API request to the main server,
  // we need to handle it directly
  if (IS_PRODUCTION) {
    // This will be used when the proxy targets itself
    app.use("/v1", (req, res, next) => {
      console.log(`📦 Handling API request directly: ${req.method} ${req.url}`);
      next();
    });
  }

  let vite;

  if (IS_PRODUCTION) {
    // Serve static files in production
    const staticPath = path.resolve(__dirname, "./dist/client");
    if (fs.existsSync(staticPath)) {
      app.use(express.static(staticPath, { index: false }));
      console.log(`📁 Serving static from: ${staticPath}`);
    }
  } else {
    // Development mode with Vite
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: path.resolve(__dirname, "."),
    });

    app.use(vite.middlewares);
  }

  // Handle all other routes - serve the React app
  app.use("*", async (req, res, next) => {
    // Skip API and health routes
    if (req.path.startsWith("/v1") || req.path.startsWith("/health")) {
      return next();
    }

    try {
      let template, render;

      if (IS_PRODUCTION) {
        // Production: serve built index.html
        template = fs.readFileSync(
          path.resolve(__dirname, "./dist/client/index.html"),
          "utf-8",
        );

        try {
          render = (await import("./dist/server/server-entry.js")).render;
        } catch (e) {
          console.log("SSR not available");
        }
      } else {
        // Development: use Vite
        template = await vite.transformIndexHtml(
          req.originalUrl,
          fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf-8"),
        );
        render = (await vite.ssrLoadModule("/src/server-entry.jsx")).render;
      }

      const context = {};
      const appHtml = render ? render(req.originalUrl, context) : "";
      const html = template.replace("<!-- ssr -->", appHtml);

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.error("❌ Error serving page:", e);
      next(e);
    }
  });

  // Error handling
  app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).send("Server Error");
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Production mode: ${IS_PRODUCTION}`);
    console.log(`🎯 API endpoint: /v1/*`);
  });
}

createCustomServer().catch(console.error);
