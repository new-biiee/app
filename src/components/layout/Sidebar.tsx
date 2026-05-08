import React from "react";
import {
  AreaChart,
  Wallet,
  ArrowRightToLine,
  ArrowLeftToLine,
  User,
  BookOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarnotIcon } from "../../assets/carnot/CarnotIcon";
import { CarnotFullLogo } from "../../assets/carnot/CarnotFullLogo";

const starAnimationStyle = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.35; }
    25% { opacity: 0.85; }
    50% { opacity: 0.35; }
    75% { opacity: 0.95; }
  }
  @keyframes twinkleSlow {
    0%, 100% { opacity: 0.3; }
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
  .starfield-animated {
    animation: twinkle 3.2s ease-in-out infinite, drift 7.5s ease-in-out infinite;
  }
  .starfield-animated-slow {
    animation: twinkleSlow 4.8s ease-in-out infinite, drift 9.2s ease-in-out infinite;
  }
  .starfield-animated-glimmer {
    animation: glimmer 2.4s ease-in-out infinite, drift 8.1s ease-in-out infinite;
  }
`;

if (typeof document !== "undefined") {
  if (!document.getElementById("sidebar-star-animation-styles")) {
    const style = document.createElement("style");
    style.id = "sidebar-star-animation-styles";
    style.textContent = starAnimationStyle;
    document.head.appendChild(style);
  }
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type SidebarProps = {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const BRAND_ACCENT = "#3ef4ff";

  const navItems = [
    { icon: AreaChart, label: "Trade", path: "/trade" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    {
      icon: BookOpen,
      label: "Documentation",
      path: "/documentation/overview/what-is-carnot",
    },
  ];

  return (
    <>
      <aside
        className={cn(
          "hidden xl:flex fixed left-4 top-4 bottom-4 flex-col z-50 transition-all duration-300 rounded-2xl border border-white/10 overflow-hidden",
          isCollapsed ? "w-[84px]" : "w-[252px]",
        )}
        style={{
          background:
            "linear-gradient(160deg, rgba(18, 34, 46, 0.72) 0%, rgba(8, 20, 28, 0.82) 58%, rgba(9, 24, 19, 0.76) 100%)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(62, 244, 255, 0.18)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.52), inset 0 1px 0 rgba(62,244,255,0.08), inset 0 -1px 0 rgba(46,189,133,0.08)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none starfield-animated"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 22% 18%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 15% 32%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 32% 8%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 42% 22%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 58% 14%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 68% 28%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 78% 18%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 88% 32%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 12% 48%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 28% 55%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 45% 42%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 62% 58%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 78% 48%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 8% 65%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 35% 72%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 52% 68%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 72% 75%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 85% 62%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 18% 85%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 42% 92%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 68% 88%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 88% 78%, rgba(140,252,255,0.92), transparent), radial-gradient(1.1px 1.1px at 5% 38%, rgba(255,255,255,0.83), transparent), radial-gradient(0.9px 0.9px at 25% 62%, rgba(62,244,255,0.88), transparent)",
            opacity: 0.65,
          }}
        />

        <div
          className={cn(
            "relative z-10 px-3 py-3 flex items-center",
            isCollapsed ? "justify-center" : "justify-between",
          )}
          style={{ borderBottom: "1px solid rgba(62, 244, 255, 0.18)" }}
        >
          <Link
            to="/"
            className={cn(
              "group flex items-center gap-2 rounded-xl",
              isCollapsed ? "justify-center" : "px-2 py-1",
            )}
            title="Home"
          >
            <div className="relative w-[52px] h-[50px] flex items-center">
              <div
                className={cn(
                  "transition-all duration-300",
                  isCollapsed
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none",
                )}
              >
                <CarnotIcon size={50} />
              </div>

              <div
                className={cn(
                  "absolute left-0 transition-all duration-300",
                  isCollapsed
                    ? "opacity-0 -translate-x-2 pointer-events-none"
                    : "opacity-100 translate-x-0 delay-150",
                )}
                style={{ display: isCollapsed ? "none" : undefined }}
              >
                <CarnotFullLogo iconSize={50} />
              </div>
            </div>
          </Link>
        </div>

        <nav
          className={cn(
            "relative z-10 flex-1 py-3 overflow-y-auto",
            isCollapsed ? "px-2 space-y-2" : "px-3 space-y-1.5",
          )}
        >
          {navItems.slice(0, -1).map((item, idx) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path.startsWith("/documentation") &&
                location.pathname.startsWith("/documentation"));
            return (
              <Link
                key={idx}
                to={item.path}
                title={item.label}
                className={cn(
                  "w-full relative overflow-hidden rounded-md transition-all duration-200 text-sm font-medium hover:bg-cyan-500/20",
                  isCollapsed
                    ? "h-11 flex items-center justify-center"
                    : "h-11 px-3 flex items-center gap-3",
                  isActive
                    ? "text-[#D9F3FF]"
                    : "text-[#AAB8D7] hover:text-white",
                )}
                style={
                  isActive
                    ? {
                      background:
                        "linear-gradient(90deg, rgba(62, 245, 255, 0.28) 0%, rgba(46, 189, 133, 0.2) 100%)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(62, 244, 255, 0.42), 0 0 20px rgba(62, 244, 255, 0.2), 0 0 16px rgba(46, 189, 133, 0.14)",
                    }
                    : undefined
                }
              >
                {!isActive && (
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(62, 245, 255, 0.12) 0%, rgba(46, 189, 133, 0.1) 100%)",
                    }}
                  />
                )}
                <Icon
                  size={17}
                  style={{ color: isActive ? BRAND_ACCENT : undefined }}
                  className={cn(
                    "relative z-10 transition-all duration-200 shrink-0",
                    !isActive &&
                    "text-[#87B7BD] group-hover:text-[#C7FCFF] group-hover:scale-110",
                  )}
                />
                <div
                  className={cn(
                    "relative z-10 transition-[max-width,opacity] duration-300 overflow-hidden whitespace-nowrap",
                    isCollapsed
                      ? "max-w-0 opacity-0"
                      : "max-w-[160px] opacity-100 delay-150",
                  )}
                  style={{ transitionProperty: "max-width, opacity" }}
                >
                  <span className="inline-block ml-2">{item.label}</span>
                </div>
                {isActive && (
                  <span
                    className={cn(
                      "relative z-10 text-xl font-light leading-none",
                      isCollapsed
                        ? "absolute right-1 top-1/2 -translate-y-1/2"
                        : "ml-auto",
                    )}
                    style={{
                      color: BRAND_ACCENT,
                    }}
                  >
                    |
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Documentation */}
        <div
          className={
            cn(
              "relative z-10 px-3 py-3 flex justify-center",
            )}
          style={{ borderTopColor: "rgba(62, 244, 255, 0.16)" }}
        >
          {[{
            icon: BookOpen,
            label: "Documentation",
            path: "/documentation/overview/what-is-carnot",
          }].map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path.startsWith("/documentation") &&
                location.pathname.startsWith("/documentation"));
            return (
              <Link
                to={item.path}
                title={item.label}
                className={cn(
                  "w-full relative overflow-hidden rounded-md transition-all duration-200 text-sm font-medium hover:bg-cyan-500/20",
                  isCollapsed
                    ? "h-11 flex items-center justify-center"
                    : "h-11 px-3 flex items-center gap-3",
                  isActive
                    ? "text-[#D9F3FF]"
                    : "text-[#AAB8D7] hover:text-white",
                )}
                style={
                  isActive
                    ? {
                      background:
                        "linear-gradient(90deg, rgba(62, 245, 255, 0.28) 0%, rgba(46, 189, 133, 0.2) 100%)",
                      boxShadow:
                        "inset 0 0 0 1px rgba(62, 244, 255, 0.42), 0 0 20px rgba(62, 244, 255, 0.2), 0 0 16px rgba(46, 189, 133, 0.14)",
                    }
                    : undefined
                }
              >
                {!isActive && (
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(62, 245, 255, 0.12) 0%, rgba(46, 189, 133, 0.1) 100%)",
                    }}
                  />
                )}
                <Icon
                  size={17}
                  style={{ color: isActive ? BRAND_ACCENT : undefined }}
                  className={cn(
                    "relative z-10 transition-all duration-200 shrink-0",
                    !isActive &&
                    "text-[#87B7BD] group-hover:text-[#C7FCFF] group-hover:scale-110",
                  )}
                />
                <div
                  className={cn(
                    "relative z-10 transition-[max-width,opacity] duration-300 overflow-hidden whitespace-nowrap",
                    isCollapsed
                      ? "max-w-0 opacity-0"
                      : "max-w-[160px] opacity-100 delay-150",
                  )}
                  style={{ transitionProperty: "max-width, opacity" }}
                >
                  <span className="inline-block ml-2">{item.label}</span>
                </div>
                {isActive && (
                  <span
                    className={cn(
                      "relative z-10 text-xl font-light leading-none",
                      isCollapsed
                        ? "absolute right-1 top-1/2 -translate-y-1/2"
                        : "ml-auto",
                    )}
                    style={{
                      color: BRAND_ACCENT,
                    }}
                  >
                    |
                  </span>
                )}
              </Link>
            )
          })}
      </div>

        <div
          className={cn(
            "relative z-10 px-3 py-3 border-t border-white/10 flex justify-center",
          )}
          style={{ borderTopColor: "rgba(62, 244, 255, 0.16)" }}
        >
          <button
            onClick={onToggleCollapse}
            className={cn(
              "h-10 rounded-xl border transition-all duration-200 flex items-center justify-center",
              isCollapsed ? "w-full" : "w-full gap-2",
            )}
            style={{
              borderColor: "rgba(62, 244, 255, 0.45)",
              background:
                "linear-gradient(90deg, rgba(62, 244, 255, 0.09) 0%, rgba(46, 189, 133, 0.08) 100%)",
              color: BRAND_ACCENT,
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ArrowRightToLine size={16} />
            ) : (
              <ArrowLeftToLine size={16} />
            )}
            <div
              className={cn(
                "text-xs font-semibold transition-[max-width,opacity] duration-300 overflow-hidden whitespace-nowrap",
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-[120px] opacity-100 delay-150",
              )}
              style={{ transitionProperty: "max-width, opacity" }}
            >
              <span className="inline-block ml-2">Collapse</span>
            </div>
          </button>
        </div>
      </aside >

      <nav
        className="xl:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-center justify-around px-2 rounded-2xl border border-white/10 w-[calc(100%-16px)] max-w-[560px] overflow-hidden"
        style={{
          background:
            "linear-gradient(120deg, rgba(3, 8, 12, 0.95) 0%, rgba(8, 20, 28, 0.94) 65%, rgba(9, 23, 18, 0.93) 100%)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(62, 244, 255, 0.25)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: "64px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 18% 40%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 82% 60%, rgba(62,244,255,0.28), transparent)",
            opacity: 0.32,
          }}
        />
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className="relative z-10 flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 rounded-xl min-w-[48px] hover:bg-cyan-500/10"
              style={{ color: isActive ? BRAND_ACCENT : "#88A9AD" }}
            >
              <Icon
                size={20}
                style={{
                  color: isActive ? BRAND_ACCENT : "#88A9AD",
                  filter: isActive
                    ? "drop-shadow(0 0 8px rgba(62,244,255,0.65))"
                    : "none",
                }}
              />
              <span className="text-[10px] font-medium truncate max-w-[70px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
