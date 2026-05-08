import { useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";
import docsConfig from "../../../docs-config.json";

export function EditThisPage() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/documentation\//, "");
  const url = `https://github.com/${docsConfig.github_repo}/edit/${docsConfig.github_branch}/frontend/src/docs/content/${path}.mdx`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#7ee8a2] transition-colors"
    >
      <Pencil className="h-3 w-3" />
      Edit this page
    </a>
  );
}
