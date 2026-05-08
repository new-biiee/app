#!/usr/bin/env tsx
/**
 * Builds a client-side search index from all MDX files in src/docs/content/.
 * Outputs public/search-index.json.
 * Run: npm run build-search-index
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, relative } from "path";

interface SearchEntry {
  title: string;
  href: string;
  section: string;
  body: string;
}

const CONTENT_DIR = join(import.meta.dirname, "../src/docs/content");
const OUTPUT_FILE = join(import.meta.dirname, "../public/search-index.json");

function stripMdx(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/\$\$[\s\S]*?\$\$/g, "") // remove block math
    .replace(/\$[^$\n]+\$/g, "") // remove inline math
    .replace(/^#{1,6}\s+/gm, "") // remove heading markers
    .replace(/[*_`~]/g, "") // remove formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
    .replace(/^\s*[-|>]\s*/gm, "") // list/table/blockquote markers
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(src: string): string {
  const m = src.match(/^#\s+(.+)/m);
  return m ? m[1].trim() : "Untitled";
}

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, results);
    else if (entry.name.endsWith(".mdx")) results.push(full);
  }
  return results;
}

const files = walkDir(CONTENT_DIR);
const entries: SearchEntry[] = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = relative(CONTENT_DIR, file).replace(/\.mdx$/, "");
  const parts = rel.split("/");
  const section = parts[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const href = `/documentation/${rel}`;
  const title = extractTitle(src);
  const body = stripMdx(src).slice(0, 300);
  entries.push({ title, href, section, body });
}

mkdirSync(join(import.meta.dirname, "../public"), { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
console.log(`Search index written: ${entries.length} pages → ${OUTPUT_FILE}`);
