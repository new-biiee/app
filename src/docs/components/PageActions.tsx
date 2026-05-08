import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MoreHorizontal, Copy, FileText, ExternalLink } from "lucide-react";
import docsConfig from "../../../docs-config.json";

const BRAND_ACCENT = "#3ef4ff";

export function PageActions() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const pageUrl = `${docsConfig.production_url}${location.pathname}`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function copyPage() {
    const path = location.pathname.replace(/^\/documentation\//, "");
    try {
      const res = await fetch(`/raw/${path}.mdx`);
      const text = res.ok ? await res.text() : pageUrl;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  function viewMarkdown() {
    const path = location.pathname.replace(/^\/documentation\//, "");
    window.open(`/raw/${path}.mdx`, "_blank");
    setOpen(false);
  }

  function openInChatGPT() {
    const prompt = `Read this documentation page and help me understand it:\n\n${pageUrl}`;
    window.open(
      `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
      "_blank"
    );
    setOpen(false);
  }

  function openInClaude() {
    const prompt = `Read this documentation page and help me understand it:\n\n${pageUrl}`;
    window.open(
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
      "_blank"
    );
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 hover:border-white/20 hover:text-white transition-colors"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
        Actions
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 overflow-hidden rounded-lg border border-white/10 bg-[#111] shadow-xl">
          <button
            onClick={copyPage}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-white transition-colors"
          >
            <Copy className={`h-3.5 w-3.5 text-[${BRAND_ACCENT}]`} />
            {copied ? "Copied!" : "Copy page"}
          </button>
          <button
            onClick={viewMarkdown}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-white transition-colors"
          >
            <FileText className={`h-3.5 w-3.5 text-[${BRAND_ACCENT}]`} />
            View as Markdown
          </button>
          <div className="my-1 border-t border-white/5" />
          <button
            onClick={openInChatGPT}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#897ff1]" />
            Open in ChatGPT
          </button>
          <button
            onClick={openInClaude}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#897ff1]" />
            Open in Claude
          </button>
        </div>
      )}
    </div>
  );
}
