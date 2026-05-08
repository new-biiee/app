#!/usr/bin/env tsx
/**
 * Checks all internal links in MDX files.
 * - Validates that every [text](/docs/section/page) link resolves to a real MDX file
 * - Reports broken links and exits with code 1 if any found
 * Run: npm run check-links
 */
import { readdirSync, existsSync, readFileSync } from "fs";
import { join, relative } from "path";

const CONTENT_DIR = join(import.meta.dirname, "../src/docs/content");

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, results);
    else if (entry.name.endsWith(".mdx")) results.push(full);
  }
  return results;
}

function extractInternalLinks(src: string): string[] {
  const links: string[] = [];
  // Matches [text](/docs/...) style links
  for (const m of src.matchAll(/\[([^\]]+)\]\(\/docs\/([^)\s]+)\)/g)) {
    links.push(`/docs/${m[2]}`);
  }
  return links;
}

function hrefToFile(href: string): string {
  const path = href.replace(/^\/docs\//, "");
  return join(CONTENT_DIR, `${path}.mdx`);
}

const files = walkDir(CONTENT_DIR);
const broken: Array<{ file: string; link: string }> = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const links = extractInternalLinks(src);
  for (const link of links) {
    const target = hrefToFile(link);
    if (!existsSync(target)) {
      broken.push({ file: relative(CONTENT_DIR, file), link });
    }
  }
}

if (broken.length === 0) {
  console.log(`✓ All internal links valid (checked ${files.length} files)`);
  process.exit(0);
} else {
  console.error(`✗ Found ${broken.length} broken link(s):\n`);
  for (const { file, link } of broken) {
    console.error(`  ${file} → ${link}`);
  }
  process.exit(1);
}
