import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { loadSearchIndex, searchEntries, type SearchEntry } from "../lib/search";

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      loadSearchIndex().then(setIndex);
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setResults(searchEntries(index, query));
    setSelected(0);
  }, [query, index]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown")
      setSelected((s) => Math.min(s + 1, results.length - 1));
    if (e.key === "ArrowUp") setSelected((s) => Math.max(s - 1, 0));
    if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].href);
      onClose();
    }
    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl rounded-xl border border-white/10 bg-[#111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-gray-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
          <button onClick={onClose}>
            <X className="h-4 w-4 text-gray-500 hover:text-white transition-colors" />
          </button>
        </div>
        {results.length > 0 ? (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => (
              <li key={r.href}>
                <button
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    i === selected ? `bg-[#44baff33]` : "hover:bg-white/5"
                  }`}
                  onClick={() => {
                    navigate(r.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelected(i)}
                >
                  <div className="text-sm font-medium text-white">{r.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {r.section}
                  </div>
                  {r.body && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {r.body}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : query ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No results for "{query}"
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            Type to search...
          </div>
        )}
        <div className="border-t border-white/5 px-4 py-2 flex gap-4 text-[10px] text-gray-600">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
