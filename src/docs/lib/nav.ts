import { FLAT_PAGES, type NavPage } from "../config/nav";

export function getPrevNext(currentHref: string): {
  prev: NavPage | null;
  next: NavPage | null;
} {
  const idx = FLAT_PAGES.findIndex((p) => p.href === currentHref);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? FLAT_PAGES[idx - 1] : null,
    next: idx < FLAT_PAGES.length - 1 ? FLAT_PAGES[idx + 1] : null,
  };
}

/** Convert a /documentation/section/page href to the MDX glob key */
export function hrefToGlobKey(href: string): string {
  // /documentation/overview/what-is-carnot -> ./content/overview/what-is-carnot.mdx
  const path = href.replace(/^\/documentation\//, "");
  return `./content/${path}.mdx`;
}
