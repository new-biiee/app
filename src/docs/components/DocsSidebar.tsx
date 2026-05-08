'use client';
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV, type NavSection } from "../config/nav";
import { ChevronDown, ChevronRight } from "lucide-react";

const BRAND_ACCENT = "#3ef4ff";
const BRAND_ACCENT_BACKDROP = "rgba(68, 186, 255, 0.2)";

function SidebarSection({
  section,
  onClose,
}: {
  section: NavSection;
  onClose?: () => void;
}) {
  const location = useLocation();
  const isActive = section.pages.some((p) => p.href === location.pathname);
  const [open, setOpen] = useState(isActive);
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between rounded px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-[${BRAND_ACCENT}] transition-colors`}
      >
        <span>{section.title}</span>
        {open ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
      </button>
      {open && (
        <ul className="mt-0.5 ml-3 border-l border-white/10 pl-3">
          {section.pages.map((page) => {
            const active = location.pathname === page.href;
            return (
              <li key={page.href}>
                <Link
                  to={page.href}
                  onClick={onClose}
                  className={`block rounded-md py-1.5 px-3 text-sm transition-colors ${active
                    ? "font-bold"
                    : "text-gray-400 hover:text-gray-200"
                    }`}
                  style={
                    active ? {
                      backgroundColor: BRAND_ACCENT_BACKDROP,
                      color: BRAND_ACCENT,
                    } : {}}
                >
                  {page.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DocsSidebar({ onClose }: { onClose?: () => void }) {
  return (
    <nav className="h-full overflow-y-auto py-6 pr-2">
      <div className="mb-6 px-3">
        <Link
          to="/documentation/overview/what-is-carnot"
          onClick={onClose}
          className="flex items-center gap-2 text-white"
        >
          <span className="text-lg font-bold tracking-tight">CARNOT</span>
          <span className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: BRAND_ACCENT_BACKDROP, color: BRAND_ACCENT }}
          >
            DOCS
          </span>
        </Link>
      </div>
      {NAV.map((section) => (
        <SidebarSection key={section.slug} section={section} onClose={onClose} />
      ))}
    </nav>
  );
}
