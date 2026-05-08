#!/usr/bin/env tsx
/**
 * Generates public/llms.txt and public/llms-full.txt from all MDX files.
 * llms.txt: concise index (title + URL) per the llmstxt.org spec
 * llms-full.txt: concatenated full content of all pages
 * Run: npm run build-llms-txt
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, relative } from "path";

const CONTENT_DIR = join(import.meta.dirname, "../src/docs/content");
const PUBLIC_DIR = join(import.meta.dirname, "../public");

// Read production URL from docs-config.json
const config = JSON.parse(
  readFileSync(join(import.meta.dirname, "../docs-config.json"), "utf8")
) as { production_url: string; site_title: string; site_description: string };

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, results);
    else if (entry.name.endsWith(".mdx")) results.push(full);
  }
  return results.sort();
}

function extractTitle(src: string): string {
  const m = src.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : "Untitled";
}

const files = walkDir(CONTENT_DIR);
const lines: string[] = [];
const fullParts: string[] = [];

lines.push(`# ${config.site_title}`);
lines.push(`> ${config.site_description}`);
lines.push("");

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = relative(CONTENT_DIR, file).replace(/\.mdx$/, "");
  const href = `/documentation/${rel}`;
  const url = `${config.production_url}${href}`;
  const title = extractTitle(src);

  lines.push(`- [${title}](${url})`);

  fullParts.push(`\n${"=".repeat(80)}`);
  fullParts.push(`# ${title}`);
  fullParts.push(`URL: ${url}`);
  fullParts.push("=".repeat(80));
  fullParts.push(src);
}

mkdirSync(PUBLIC_DIR, { recursive: true });
writeFileSync(join(PUBLIC_DIR, "llms.txt"), lines.join("\n") + "\n");
writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), fullParts.join("\n") + "\n");
console.log(`llms.txt → ${files.length} pages`);
console.log(`llms-full.txt → ${files.length} pages (full content)`);
