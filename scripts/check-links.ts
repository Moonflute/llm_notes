import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = join(process.cwd(), "out");
const basePath = process.env.GITHUB_ACTIONS ? "/llm_notes" : "";

if (!existsSync(root)) throw new Error("Static output is missing. Run npm run build first.");

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? htmlFiles(join(dir, entry.name)) : entry.name.endsWith(".html") ? [join(dir, entry.name)] : [],
  );
}

function outputTarget(href: string): string | null {
  let pathname = href.split(/[?#]/)[0];
  if (basePath && pathname === basePath) pathname = "/";
  else if (basePath && pathname.startsWith(`${basePath}/`)) pathname = pathname.slice(basePath.length);
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;

  const outputPath = pathname.replace(/^\//, "");
  if (pathname === "/") return join(root, "index.html");
  if (extname(outputPath)) return join(root, outputPath);
  return join(root, outputPath, "index.html");
}

const problems: string[] = [];
for (const file of htmlFiles(root)) {
  const html = readFileSync(file, "utf8");
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of links) {
    const target = outputTarget(href);
    if (target && !existsSync(target)) problems.push(`${relative(root, file)} -> ${href}`);
  }
}

if (problems.length) {
  console.error(`Broken internal links:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log("Static internal-link check passed.");