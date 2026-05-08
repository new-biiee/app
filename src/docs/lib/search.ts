export interface SearchEntry {
  title: string;
  href: string;
  section: string;
  body: string;
}

let cachedIndex: SearchEntry[] | null = null;

export async function loadSearchIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return cachedIndex;
  try {
    const res = await fetch("/search-index.json");
    if (!res.ok) return [];
    cachedIndex = await res.json();
    return cachedIndex ?? [];
  } catch {
    return [];
  }
}

export function searchEntries(
  entries: SearchEntry[],
  query: string
): SearchEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return entries
    .filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.section.toLowerCase().includes(q)
    )
    .slice(0, 10);
}
