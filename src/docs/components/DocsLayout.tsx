import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, ExternalLink } from "lucide-react";
import { DocsSidebar } from "./DocsSidebar";
import { SearchModal } from "./SearchModal";
import { UpcomingCard } from "./UpcomingCard";

const BorderColor = "rgba(71, 246, 255, 0.2)";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div
      className="relative h-full mt-4 text-gray-200 overflow-hidden"
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(3, 8, 12, 0.55) 0%, rgba(8, 20, 28, 0.95) 58%, rgba(9, 23, 24, 0.35) 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 starfield-animated"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 22% 18%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 15% 32%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 32% 8%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 42% 22%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 58% 14%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 68% 28%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 78% 18%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 88% 32%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 12% 48%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 28% 55%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 45% 42%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 62% 58%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 78% 48%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 8% 65%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 35% 72%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 52% 68%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 72% 75%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 85% 62%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 18% 85%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 42% 92%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 68% 88%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 88% 78%, rgba(140,252,255,0.92), transparent)",
          opacity: 0.55,
        }}
      />

      <div className="relative z-10 flex w-full gap-3 px-2 h-full">
        {/* Desktop sidebar */}
        <aside
          className="sticky top-4 hidden rounded-2xl hidden w-64 overflow-y-auto border lg:block px-2"
          style={{ borderColor: BorderColor }}
        >
          <DocsSidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 shadow-xl">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-bold text-white text-sm">Navigation</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <DocsSidebar onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="relative flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header
            className="sticky top-0 z-40 flex justify-between h-14 items-center gap-4 border-b px-2 backdrop-blur-md"
            style={{
              borderColor: BorderColor,
            }}
          >
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <UpcomingCard />
            <div className="flex gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-500 hover:border-white/20 hover:text-gray-300 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search docs...</span>
                <kbd className="hidden sm:inline rounded border border-white/10 px-1 text-[10px]">
                  ⌘K
                </kbd>
              </button>

              <Link
                to="/"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">App</span>
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-1 pt-2 lg:px-1 xl:px-2 h-full pb-18">
            <div
              className="mx-auto w-full max-w-[1320px] p-4 lg:p-6 h-full overflow-y-auto"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
