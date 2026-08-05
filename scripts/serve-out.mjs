import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const basePath = process.env.GITHUB_ACTIONS ? "/llm_notes" : "";
const types = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".xml": "application/xml", ".txt": "text/plain",
};

const server = createServer((request, response) => {
  let raw = new URL(request.url ?? "/", "http://localhost").pathname;
  if (basePath && raw === basePath) raw = "/";
  else if (basePath && raw.startsWith(`${basePath}/`)) raw = raw.slice(basePath.length);

  const safe = normalize(raw).replace(/^([.][.][/\\])+/, " ").trim();
  let target = join(root, safe);
  if (raw.endsWith("/")) target = join(target, "index.html");
  else if (!extname(target)) target = join(target, "index.html");

  if (!existsSync(target) || statSync(target).isDirectory()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": types[extname(target)] ?? "application/octet-stream" });
  createReadStream(target).pipe(response);
});

server.listen(Number(process.env.PORT ?? 4173), "127.0.0.1");
const stop = () => server.close(() => process.exit(0));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);