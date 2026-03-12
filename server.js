import fs from "node:fs";
import path from "node:path";

const IS_PRODUCTION = process.env.ENV === "production";
const distClient = path.resolve("./dist/client");
const distServer = path.resolve("./dist/server");

export default async function handler(req, res) {
  try {
    const url = req.url;

    // Serve static files from dist/client
    const filePath = path.join(distClient, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const stream = fs.createReadStream(filePath);
      res.setHeader("Content-Type", getContentType(filePath));
      stream.pipe(res);
      return;
    }

    // SSR: import server bundle dynamically
    const { render } = await import(path.join(distServer, "server-entry.js"));

    const context = {};
    const appHtml = await render(url, context);

    // Read HTML template
    const templatePath = IS_PRODUCTION
      ? path.join(distClient, "index.html")
      : path.resolve("./index.html");
    const template = fs.readFileSync(templatePath, "utf-8");

    const html = template.replace("<!-- ssr -->", appHtml);

    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;
    res.end(html);
  } catch (err) {
    console.error("SSR Error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}

// Simple content type mapping
function getContentType(filePath) {
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".json")) return "application/json";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg"))
    return "image/jpeg";
  return "text/plain";
}
