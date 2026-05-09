import { lazy, Suspense } from "react";
import { useParams, Navigate } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import { DocsLayout } from "./components/DocsLayout";
import { PrevNextNav } from "./components/PrevNextNav";
import { PageActions } from "./components/PageActions";
import { EditThisPage } from "./components/EditThisPage";
import { MDX_COMPONENTS } from "./components/MdxComponents";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

// Eagerly import all MDX files so Vite knows about them at build time
const modules = import.meta.glob<{ default: React.ComponentType }>(
  "./content/**/*.mdx"
);

function PageLoader({ section, slug }: { section: string; slug: string }) {
  const key = `./content/${section}/${slug}.mdx`;
  const loader = modules[key];

  if (!loader) {
    return (
      <div className="py-20 text-center">
        <p className="text-2xl font-bold text-white mb-3">Page not found</p>
        <p className="text-gray-400 text-sm">
          No documentation page at <code className="text-[#7ee8a2]">{key}</code>
        </p>
      </div>
    );
  }

  const MDXPage = lazy(loader as () => Promise<{ default: React.ComponentType }>);

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-gray-500 text-sm">
          Loading...
        </div>
      }
    >
      <MDXProvider components={MDX_COMPONENTS}>
        <MDXPage />
      </MDXProvider>
    </Suspense>
  );
}

export function DocsRouter() {
  const { section, slug } = useParams<{ section: string; slug: string }>();

  if (!section) {
    return <Navigate to="/documentation/overview/what-is-carnot" replace />;
  }
  if (!slug) {
    // Redirect to first page of the section
    const sectionFirstPages: Record<string, string> = {
      overview: "what-is-carnot",
      "getting-started": "installation",
      "core-mechanics": "trade-lifecycle",
      fairness: "overview",
      "zk-settlement": "overview",
      "smart-contracts": "program-overview",
      backend: "architecture",
      api: "authentication",
      diagram: "overview",
    };
    const first = sectionFirstPages[section];
    if (first) return <Navigate to={`/documentation/${section}/${first}`} replace />;
  }

  return (
    <DocsLayout>
      {/* Page top bar */}
      <div className="mb-6 flex items-center justify-between">
        <EditThisPage />
        <PageActions />
      </div>

      {/* MDX content */}
      <PageLoader key={`${section}/${slug}`} section={section!} slug={slug!} />

      {/* Prev / Next navigation */}
      <PrevNextNav />
    </DocsLayout>
  );
}
