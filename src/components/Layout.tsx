import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./layout/Sidebar";
import { Header } from "./layout/Header";
import { 
  Bitcoin, 
  CircleDollarSign,  
  Gem,
} from "lucide-react";
import { SolanaSVGLogo } from "../constant/solana_logo";
import { JupiterLogo } from "../constant/Jupiter_logo";
import { FRONTEND_MARKETS, getMarketLabel } from "../config/markets";
import { useGameStore } from "../store/store";

const starAnimationStyle = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; }
    25% { opacity: 0.85; }
    50% { opacity: 0.35; }
    75% { opacity: 0.95; }
  }
  @keyframes twinkleSlow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.7; }
  }
  @keyframes glimmer {
    0%, 100% { opacity: 0.3; filter: brightness(0.8); }
    50% { opacity: 1; filter: brightness(1.2); }
  }
  @keyframes drift {
    0%, 100% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(2px) translateY(-1px); }
    50% { transform: translateX(-1px) translateY(2px); }
    75% { transform: translateX(-2px) translateY(-2px); }
  }
  @keyframes panelGradientShift {
    0%, 100% { background-position: 0% 50%, 100% 0%, 50% 100%, 0% 0%; }
    50% { background-position: 100% 50%, 0% 100%, 50% 0%, 100% 100%; }
  }
  @keyframes panelGlowDrift {
    0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
    50% { transform: scale(1.01) translate3d(0, -2px, 0); }
  }
  @keyframes panelSheenSweep {
    0% { background-position: -120% 0, 0 0; }
    100% { background-position: 220% 0, 0 0; }
  }
  .starfield-animated {
    animation: twinkle 3.2s ease-in-out infinite, drift 7.5s ease-in-out infinite;
  }
  .starfield-animated-slow {
    animation: twinkleSlow 4.8s ease-in-out infinite, drift 9.2s ease-in-out infinite;
  }
  .starfield-animated-glimmer {
    animation: glimmer 2.4s ease-in-out infinite, drift 8.1s ease-in-out infinite;
  }
  .panel-tech-overlay {
    animation: panelSheenSweep 5.5s linear infinite;
  }
`;

if (typeof document !== 'undefined') {
  if (!document.getElementById('layout-star-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'layout-star-animation-styles';
    style.textContent = starAnimationStyle;
    document.head.appendChild(style);
  }
}

const VALID_ROUTES = [
  "/",
  "/trade",
  "/profile",
  "/wallet",
]

const marketIconFor = (marketId: string) => {
  const id = marketId.toLowerCase();
  if (id.startsWith("btc")) return <Bitcoin size={14} />;
  if (id.startsWith("jup")) return <JupiterLogo className="w-4 h-4" />;
  if (id.startsWith("sol")) return <SolanaSVGLogo className="w-3 h-3" />;
  if (id.includes("usd")) return <CircleDollarSign size={14} />;
  return <Gem size={14} />;
};

const markets = FRONTEND_MARKETS.map((m) => ({
  id: m.id,
  label: m.label,
  icon: marketIconFor(m.id),
}));

export const Layout: React.FC = () => {
  const location = useLocation();
  const isIntro = location.pathname === "/";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const selectedMarketId = useGameStore((state) => state.selectedMarketId);
  const setSelectedMarketId = useGameStore((state) => state.setSelectedMarketId);
  const [isMaximized, setIsMaximized] = useState(false);

  const isDocPath = location.pathname.startsWith("/documentation");
  const isValidRoute = VALID_ROUTES.includes(location.pathname);

  if (!isValidRoute && !isDocPath) {
    return (
      <div
        className="flex h-screen w-full text-white font-sans overflow-hidden relative"
        style={{ background: "#030507", fontFamily: "'Inter', sans-serif" }}
      >
        <div
          className="absolute inset-0 pointer-events-none starfield-animated"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 15% 28%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 12% 45%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 28% 18%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 38% 38%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 45% 8%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 58% 52%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 68% 22%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 78% 68%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 12% 75%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 32% 82%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 52% 48%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 68% 88%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 82% 35%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 88% 58%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 22% 92%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 48% 15%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 75% 75%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 92% 48%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 18% 58%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 42% 62%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 65% 12%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 92% 72%, rgba(140,252,255,0.92), transparent), radial-gradient(1.1px 1.1px at 5% 38%, rgba(255,255,255,0.83), transparent), radial-gradient(0.9px 0.9px at 38% 72%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 72% 42%, rgba(255,255,255,0.9), transparent), radial-gradient(1.2px 1.2px at 18% 22%, rgba(62,244,255,0.85), transparent), radial-gradient(0.8px 0.8px at 82% 8%, rgba(140,252,255,0.89), transparent), radial-gradient(1px 1px at 55% 68%, rgba(255,255,255,0.84), transparent), radial-gradient(1.1px 1.1px at 28% 38%, rgba(62,244,255,0.91), transparent)",
            opacity: 0.78,
          }}
        />
        <Outlet />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full text-white font-sans overflow-hidden relative"
      style={{ background: "#030507", fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="absolute inset-0 pointer-events-none starfield-animated"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 15% 28%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 12% 45%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 28% 18%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 38% 38%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 45% 8%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 58% 52%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 68% 22%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 78% 68%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 12% 75%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 32% 82%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 52% 48%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 68% 88%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 82% 35%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 88% 58%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 22% 92%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 48% 15%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 75% 75%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 92% 48%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 18% 58%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 42% 62%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 65% 12%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 92% 72%, rgba(140,252,255,0.92), transparent), radial-gradient(1.1px 1.1px at 5% 38%, rgba(255,255,255,0.83), transparent), radial-gradient(0.9px 0.9px at 38% 72%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 72% 42%, rgba(255,255,255,0.9), transparent), radial-gradient(1.2px 1.2px at 18% 22%, rgba(62,244,255,0.85), transparent), radial-gradient(0.8px 0.8px at 82% 8%, rgba(140,252,255,0.89), transparent), radial-gradient(1px 1px at 55% 68%, rgba(255,255,255,0.84), transparent), radial-gradient(1.1px 1.1px at 28% 38%, rgba(62,244,255,0.91), transparent)",
          opacity: 0.78,
        }}
      />

      {(!isIntro && !isMaximized) && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}

      <main
        className={`flex-1 flex flex-col h-full relative z-10 transition-all duration-300 overflow-auto ${isIntro
          ? ""
          : `${isSidebarCollapsed ? "xl:pl-[112px]" : "xl:pl-[276px]"} 2xl:${isSidebarCollapsed ? "pl-[120px]" : "pl-[292px]"
          } pb-[90px] xl:pb-4 px-3 sm:px-4 xl:pr-5`
          }`}
      >
        {(!isIntro && !isDocPath) && <div className={isMaximized ? "hidden" : ""}>
          <Header  
            selectedMarketId={selectedMarketId}
            selectedMarketLabel={getMarketLabel(selectedMarketId)}
            markets={markets}
            setSelectedMarketId={setSelectedMarketId}
          />
        </div>}

        {(!isIntro && !isDocPath) ? (
          <section
            className="relative mt-2 xl:mt-3 rounded-2xl border border-white/10 flex-1 min-h-0 overflow-hidden"
            style={{
              borderColor: "rgba(62, 244, 255, 0.2)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(62, 244, 255, 0.08), inset 0 -1px 0 rgba(46, 189, 133, 0.08)",
            }}
          >
            <div
              className="relative z-10 p-3 sm:p-4 xl:p-5 h-full min-h-0 transition-transform duration-500"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(3, 37, 61, 0.12) 50%, rgba(16, 29, 51, 0.12) 50%, rgba(20, 46, 52, 0.2) 62%, rgba(18, 67, 88, 0.24) 80%)",
                backgroundPosition: "center",
                borderRadius: "inherit",
              }}
            >
              <div
                className="panel-tech-overlay pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(105deg, rgba(62, 244, 255, 0) 25%, rgba(62, 244, 255, 0.08) 40%, rgba(140, 252, 255, 0.14) 50%, rgba(46, 189, 133, 0.08) 60%, rgba(62, 244, 255, 0) 75%), repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 18px)",
                  opacity: 0.55,
                  mixBlendMode: "screen",
                }}
              />
              <Outlet context={{ isMaximized, setIsMaximized }} />
            </div>
          </section>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};
