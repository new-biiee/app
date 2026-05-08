import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Link } from "react-router-dom";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    background: "#0d0d0d",
    primaryColor: "#30654d",
    primaryTextColor: "#e5e7eb",
    primaryBorderColor: "#30654d",
    lineColor: "#897ff1",
    secondaryColor: "#1a1a2e",
    tertiaryColor: "#0d0d0d",
    edgeLabelBackground: "#1a1a1a",
    clusterBkg: "#111",
    titleColor: "#897ff1",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "13px",
  },
});

let mermaidCounter = 0;

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useRef(`mermaid-${++mermaidCounter}`);

  useEffect(() => {
    if (!ref.current) return;
    mermaid
      .render(id.current, code)
      .then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      })
      .catch(() => {
        if (ref.current)
          ref.current.innerHTML = `<pre class="text-red-400 text-xs">${code}</pre>`;
      });
  }, [code]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-lg border border-[#30654d]/30 bg-[#0d0d0d] p-4"
    />
  );
}

function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const lang = className?.replace("language-", "") ?? "";
  if (lang === "mermaid") {
    return <MermaidDiagram code={String(children).trim()} />;
  }
  return (
    <pre className="my-4 overflow-x-auto rounded-lg border border-white/10 bg-[#111] p-4 text-sm leading-relaxed">
      <code className={className}>{children}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[#3ef4ff]/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#3ef4ff]">
      {children}
    </code>
  );
}

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip" | "note";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-[#897ff1]/40 bg-[#897ff1]/5 text-[#c4bdff]",
    warning: "border-yellow-500/40 bg-yellow-500/5 text-yellow-200",
    tip: "border-[#30654d]/60 bg-[#30654d]/10 text-[#7ee8a2]",
    note: "border-white/20 bg-white/5 text-gray-300",
  };
  const icons = { info: "ℹ", warning: "⚠", tip: "✦", note: "📝" };

  return (
    <div
      className={`my-4 flex gap-3 rounded-lg border p-4 text-sm ${styles[type]}`}
    >
      <span className="mt-0.5 shrink-0 text-base">{icons[type]}</span>
      <div>{children}</div>
    </div>
  );
}

export const MDX_COMPONENTS = {
  pre: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  code: ({ children, className }: { children: string; className?: string }) => {
    if (!className && !String(children).includes("\n")) {
      return <InlineCode>{children}</InlineCode>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  inlineCode: InlineCode,
  Callout,
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="mb-6 mt-2 border-b border-white/10 pb-4 text-3xl font-bold tracking-tight text-white">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 mt-10 text-[1.85rem] font-semibold text-[#3ef4ff]">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-2 mt-6 text-[1.4rem] font-semibold text-white">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="mb-2 mt-4 text-base font-semibold text-[#8cfcff]">
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="my-3 text-[1.08rem] leading-8 text-gray-200">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
    const normalizedHref = href?.replace(
      /^\/docs\//,
      "/documentation/",
    );

    if (normalizedHref?.startsWith("/")) {
      return (
        <Link
          to={normalizedHref}
          className="text-[#3ef4ff] underline decoration-[#3ef4ff]/40 underline-offset-2 hover:decoration-[#3ef4ff]"
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        href={normalizedHref}
        className="text-[#3ef4ff] underline decoration-[#3ef4ff]/40 underline-offset-2 hover:decoration-[#3ef4ff]"
      >
        {children}
      </a>
    );
  },
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-3 ml-4 list-disc space-y-1 text-gray-200 marker:text-[#3ef4ff]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-3 ml-4 list-decimal space-y-1 text-gray-200">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-[1.06rem] leading-8">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-4 border-l-2 border-[#3ef4ff]/60 pl-4 text-gray-300 italic">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-[#3ef4ff]/20">
      <table className="w-full text-[1.03rem] text-gray-200">{children}</table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="border-b border-[#3ef4ff]/20 bg-[#0d151a] text-xs uppercase tracking-wider text-gray-300">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="divide-y divide-[#3ef4ff]/10">{children}</tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="hover:bg-[#3ef4ff]/5">{children}</tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left font-medium">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-3">{children}</td>
  ),
  hr: () => <hr className="my-8 border-white/10" />,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-300">{children}</em>
  ),
};
