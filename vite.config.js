/* eslint no-restricted-globals: ["error", "event"] */
/* global process */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: {
    ssr: command === "build",
    outDir: command === "build" ? "dist/server" : "dist/client",
    rollupOptions: {
      input: path.resolve(__dirname, "src/server-entry.jsx"),
    },
  },
  esbuild: {
    logOverride: { "duplicate-key": "silent" }, // ignores duplicate key warnings
  },
  ssr: {
    noExternal: ["yjs", "y-websocket", "y-indexeddb"],
  },
  server: {
    hmr: {
      // Compute HMR port from PORT env when available; otherwise fall back to a safe default.
      // On Windows npm scripts the "PORT=..." syntax doesn't set env vars — avoid NaN.
      port:
        Number.isFinite(Number(process.env.PORT)) &&
        process.env.PORT !== undefined
          ? parseInt(process.env.PORT, 10) + 2000
          : 5173,
      host: "localhost",
      protocol: "ws",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "@pages": path.resolve(__dirname, "./src/pages"),
      // "@schema": path.resolve(__dirname, "./src/schema"),
      // "@types": path.resolve(__dirname, "./src/types"),
      // "@hooks": path.resolve(__dirname, "./src/hooks"),
      // "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
}));
