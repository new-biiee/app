import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPrevNext } from "../lib/nav";

const BRAND_ACCENT = "#3ef4ff";

export function PrevNextNav() {
  const location = useLocation();
  const { prev, next } = getPrevNext(location.pathname);

  if (!prev && !next) return null;

  return (
    <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
      {prev ? (
        <Link
          to={prev.href}
          className="group flex items-center gap-2 rounded-lg border border-cyan-500/20 px-4 py-3 text-sm text-gray-400 hover:border-[#30654d]/40 hover:text-white transition-colors"
        >
          <ArrowLeft className={`h-4 w-4 shrink-0 text-[${BRAND_ACCENT}] transition-transform group-hover:-translate-x-0.5`} />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
              Previous
            </div>
            <div>{prev.title}</div>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={next.href}
          className="group flex items-center gap-2 rounded-lg border border-cyan-500/20 px-4 py-3 text-sm text-gray-400 hover:border-[#30654d]/40 hover:text-white transition-colors text-right"
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
              Next
            </div>
            <div>{next.title}</div>
          </div>
          <ArrowRight className={`h-4 w-4 shrink-0 text-[${BRAND_ACCENT}] transition-transform group-hover:translate-x-0.5`} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
