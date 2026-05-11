import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "../../../store/store";
import { format } from "date-fns";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Maximize, Minimize } from "lucide-react";
import CryptoJS from "crypto-js";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { getMarketLabel } from "../../../config/markets";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Toast Styles from original TradingGrid
const TOAST_STYLES = {
  warning: {
    background: "#5d223695",
    color: "#ff0055",
    border: "2px solid #ff0055",
    boxShadow: "0 0 10px rgba(255, 0, 85, 0.3)",
    backdropFilter: "blur(12px)",
    fontWeight: "bold",
    fontSize: "12px",
    padding: "10px 16px",
    borderRadius: "15px",
    letterSpacing: "0.02em",
  },
  info: {
    background: "#1b38559a",
    color: "#00f2ff",
    border: "2px solid #00f2ff",
    boxShadow: "0 0 10px rgba(0, 242, 255, 0.3)",
    backdropFilter: "blur(12px)",
    fontWeight: "bold",
    fontSize: "12px",
    padding: "10px 16px",
    borderRadius: "15px",
    letterSpacing: "0.02em",
  },
  caution: {
    background: "#8d8a0084",
    color: "#fff000",
    border: "2px solid #fff000",
    boxShadow: "0 0 10px rgba(255, 240, 0, 0.3)",
    backdropFilter: "blur(12px)",
    fontWeight: "bold",
    fontSize: "12px",
    padding: "10px 16px",
    borderRadius: "15px",
    letterSpacing: "0.02em",
  }
};

export const TradingGridUpdate: React.FC = () => {
  const selectedMarketId = useGameStore((state) => state.selectedMarketId);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const selectedMarketLabel = getMarketLabel(selectedMarketId);
  const { isMaximized, setIsMaximized } = useOutletContext<{ isMaximized: boolean; setIsMaximized: (v: boolean) => void }>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { publicKey } = useWallet();
  const address = useMemo(() => {
    const state = useGameStore.getState();
    return state.isDemoMode ? state.demoAddress : publicKey?.toBase58();
  }, [publicKey]);

  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null); 
  const motionCanvasRef = useRef<HTMLCanvasElement>(null); 

  const virtualNow = useRef<number>(0);
  const cameraPriceRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const lastDrawnBgCam = useRef<number>(0);
  const lastWinCheckTime = useRef<number>(0);
  
  const hoverCellId = useRef<string | null>(null);

  // Constants
  const isMobile = window.innerWidth < 640;
  const isSmallScreen = window.innerWidth < 1280;
  const pastSpanMs = isMobile ? 10000 : isSmallScreen ? 15000 : 20000;
  const futureSpanMs = isMobile ? 25000 : 35000;
  const timeSpanMs = pastSpanMs + futureSpanMs;

  const getPriceY = (p: number, camPrice: number, h: number, step: number) => {
    const maxPrice = camPrice + 4.5 * step;
    return ((maxPrice - p) / (9 * step)) * h;
  };

  const getTimeX = (t: number, now: number, w: number) => {
    return ((t - (now - pastSpanMs)) / timeSpanMs) * w;
  };

  useEffect(() => {
    const state = useGameStore.getState();
    virtualNow.current = Date.now() + state.serverTimeOffset;
    lastFrameTime.current = performance.now();
  }, []);

  const drawStaticGrid = (ctx: CanvasRenderingContext2D, camPrice: number, dims: { width: number; height: number }, step: number) => {
    ctx.clearRect(0, 0, dims.width, dims.height);
    // Removed solid background fill to allow container background/transparency to show through

    const startP = Math.floor((camPrice - 7 * step) / step) * step;
    const endP = Math.ceil((camPrice + 7 * step) / step) * step;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;

    for (let p = startP; p <= endP; p += step) {
        const y = Math.round(getPriceY(p, camPrice, dims.height, step));
        if (y >= -20 && y <= dims.height + 20) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dims.width, y); ctx.stroke();
        }
    }
    lastDrawnBgCam.current = camPrice;
  };

  const handleMouseMove = (clientX: number, clientY: number) => {
    if (!containerRef.current || dimensions.width === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const state = useGameStore.getState();
    const now = virtualNow.current;
    const clickTime = (now - pastSpanMs) + (x / dimensions.width) * timeSpanMs;
    const clickPrice = (cameraPriceRef.current + 4.5 * state.modePriceStep) - (y / dimensions.height) * (9 * state.modePriceStep);

    const cell = state.cells.find(c => 
      clickTime >= c.timeWindowStart && clickTime <= c.timeWindowEnd && 
      clickPrice >= c.priceLevel - 0.5 * state.modePriceStep && clickPrice <= c.priceLevel + 0.5 * state.modePriceStep
    );

    if (cell && cell.timeWindowStart > now) {
        hoverCellId.current = cell.id;
    } else {
        hoverCellId.current = null;
    }
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef.current || dimensions.width === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const state = useGameStore.getState();
    const now = virtualNow.current;
    const clickTime = (now - pastSpanMs) + (x / dimensions.width) * timeSpanMs;
    const clickPrice = (cameraPriceRef.current + 4.5 * state.modePriceStep) - (y / dimensions.height) * (9 * state.modePriceStep);

    const cell = state.cells.find(c => 
      clickTime >= c.timeWindowStart && clickTime <= c.timeWindowEnd && 
      clickPrice >= c.priceLevel - 0.5 * state.modePriceStep && clickPrice <= c.priceLevel + 0.5 * state.modePriceStep
    );

    if (cell) {
      const hasAnyBet = state.bets[cell.id] || state.pendingBets[cell.id];
      const isNext = cell.timeWindowStart > now && cell.timeWindowStart - now <= 5000;
      const canBet = cell.timeWindowStart > now && !hasAnyBet;

      if (isNext && !hasAnyBet) {
        toast("Zone closing! Pick another cell.", { icon: "⏳", style: TOAST_STYLES.warning, position: "top-right" });
        return;
      }

      if (canBet) {
        if (!localStorage.getItem("token")) {
          toast("Please connect your wallet first.", { icon: "🔐", style: TOAST_STYLES.info, position: "top-right" });
          return;
        }
        if (!state.betAmount || state.betAmount <= 0) {
          toast("Please enter a valid amount.", { icon: "⚠️", style: TOAST_STYLES.caution, position: "top-right" });
          return;
        }
        if (state.betAmount > state.balance) {
          toast("Insufficient balance for this trade.", { icon: "💸", style: TOAST_STYLES.warning, position: "top-right" });
          return;
        }

        if (state.socket && state.wssKey && address) {
          const microAmt = String(Math.round(state.betAmount * 1_000_000));
          const c = cell.original;
          const msg = `${c.gridTs}:${c.startTs}:${c.endTs}:${c.lowerPrice}:${c.upperPrice}:${microAmt}`;
          const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, CryptoJS.enc.Hex.parse(state.wssKey));
          hmac.update(msg);
          state.socket.emit("place_bet", { userId: address, marketId: selectedMarketId, amount: microAmt, cell: c, userSignature: hmac.finalize().toString(CryptoJS.enc.Hex) });
        }
        state.placeBet(cell.id, state.betAmount);
      }
    }
  };

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const obs = new ResizeObserver(() => {
      if (node.clientWidth > 0) setDimensions({ width: node.clientWidth, height: node.clientHeight });
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  // MASTER COMPOSITOR LOOP
  useEffect(() => {
    let frameId: number;
    const frame = (time: number) => {
      const state = useGameStore.getState();
      const dims = dimensions;
      if (dims.width === 0 || state.currentPrice === 0) { frameId = requestAnimationFrame(frame); return; }

      const dtMs = time - lastFrameTime.current;
      lastFrameTime.current = time;
      
      virtualNow.current += dtMs;
      const serverTarget = Date.now() + state.serverTimeOffset;
      virtualNow.current += (serverTarget - virtualNow.current) * 0.005;
      const now = virtualNow.current;

      // Check Win Effects (Every 100ms)
      if (time - lastWinCheckTime.current > 100) {
        const hasBets = Object.keys(state.bets).length > 0 || Object.keys(state.pendingBets).length > 0;
        if (Object.keys(state.pendingWins).length > 0 || hasBets) {
            state.checkWinEffects(now);
        }
        lastWinCheckTime.current = time;
      }

      if (cameraPriceRef.current === 0) cameraPriceRef.current = state.currentPrice;
      const cam = cameraPriceRef.current + (state.currentPrice - cameraPriceRef.current) * 0.08;
      cameraPriceRef.current = cam;

      const dpr = window.devicePixelRatio || 1;
      const step = state.modePriceStep;

      const staticCanvas = staticCanvasRef.current;
      if (staticCanvas) {
        if (staticCanvas.width !== dims.width * dpr) {
            staticCanvas.width = dims.width * dpr; staticCanvas.height = dims.height * dpr;
            staticCanvas.style.width = `${dims.width}px`; staticCanvas.style.height = `${dims.height}px`;
            lastDrawnBgCam.current = 0;
        }
        if (Math.abs(cam - lastDrawnBgCam.current) > (step * 0.01)) {
            const ctx = staticCanvas.getContext("2d");
            if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawStaticGrid(ctx, cam, dims, step); }
        }
      }

      const motionCanvas = motionCanvasRef.current;
      if (motionCanvas) {
        if (motionCanvas.width !== dims.width * dpr) {
            motionCanvas.width = dims.width * dpr; motionCanvas.height = dims.height * dpr;
            motionCanvas.style.width = `${dims.width}px`; motionCanvas.style.height = `${dims.height}px`;
        }
        const ctx = motionCanvas.getContext("2d");
        if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, dims.width, dims.height);
            
            // A. Vertical Time Lines
            const colInt = state.modeIntervalSeconds * 1000;
            const firstT = now - pastSpanMs;
            const lastT = now + futureSpanMs;
            let tL = Math.floor(firstT / colInt) * colInt;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            while (tL <= lastT + colInt) {
                const x = Math.round(getTimeX(tL, now, dims.width));
                if (x >= 0 && x <= dims.width) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dims.height); ctx.stroke();
                    if (tL % 15000 === 0) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                        ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
                        ctx.fillText(format(new Date(tL), "HH:mm:ss"), x, dims.height - 5);
                    }
                }
                tL += colInt;
            }

            // B. Multipliers & Hover Highlight
            const bets = state.bets;
            const pendingBets = state.pendingBets;
            const pendingWins = state.pendingWins;
            state.cells.forEach((cell) => {
                const x1 = getTimeX(cell.timeWindowStart, now, dims.width);
                const x2 = getTimeX(cell.timeWindowEnd, now, dims.width);
                if (x2 < 0 || x1 > dims.width) return;
                
                const y1 = getPriceY(cell.priceLevel + 0.5 * step, cam, dims.height, step);
                const y2 = getPriceY(cell.priceLevel - 0.5 * step, cam, dims.height, step);
                if (y2 < 0 || y1 > dims.height) return;

                const rx1 = Math.round(x1), rx2 = Math.round(x2), ry1 = Math.round(y1), ry2 = Math.round(y2);
                const rw = rx2 - rx1, rh = ry2 - ry1;

                const isHit = cell.status === "hit";
                const hasAnyBet = (bets[cell.id] || 0) > 0 || (pendingBets[cell.id] || 0) > 0;
                const isNext = cell.timeWindowStart > now && cell.timeWindowStart - now <= 5000;

                if (now >= cell.timeWindowStart && !hasAnyBet) return;
                if (now >= cell.timeWindowEnd && !isHit && pendingWins[cell.id] === undefined) return;

                // DRAW HIGHLIGHT if hovered
                if (hoverCellId.current === cell.id) {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                    ctx.fillRect(rx1, ry1, rw, rh);
                }

                if (isHit && hasAnyBet) {
                    ctx.fillStyle = "rgba(46,189,133,0.35)"; ctx.fillRect(rx1, ry1, rw, rh);
                    ctx.strokeStyle = "#2EBD85"; ctx.strokeRect(rx1 + 1, ry1 + 1, rw - 2, rh - 2);
                } else if (hasAnyBet && now < cell.timeWindowEnd) {
                    ctx.fillStyle = "rgba(0, 242, 255, 0.25)"; ctx.fillRect(rx1, ry1, rw, rh);
                    ctx.strokeStyle = "#00f2ff"; ctx.strokeRect(rx1 + 1, ry1 + 1, rw - 2, rh - 2);
                } else if (isNext && !hasAnyBet) {
                    const pulse = 0.2 + 0.15 * Math.sin(now / 200); 
                    ctx.fillStyle = `rgba(246, 70, 94, ${pulse})`;
                    ctx.fillRect(rx1, ry1, rw, rh);
                }

                ctx.fillStyle = (isHit && hasAnyBet) ? "#2EBD85" : (hasAnyBet && now < cell.timeWindowEnd ? "#00f2ff" : (isNext && !hasAnyBet) ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.8)");
                ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(`${cell.multiplier.toFixed(2)}x`, Math.round(rx1 + rw / 2), Math.round(ry1 + rh / 2));
            });

            // C. Locked History Chart
            const tx = (pastSpanMs / timeSpanMs) * dims.width; 
            const currentY = getPriceY(state.currentPrice, cam, dims.height, step);
            if (state.history.length > 0) {
                ctx.beginPath(); ctx.strokeStyle = "#3ef4ff"; ctx.lineWidth = 2; ctx.lineJoin = "round";
                ctx.moveTo(tx, currentY);
                for (let i = state.history.length - 1; i >= 0; i--) {
                    const pt = state.history[i];
                    const px = getTimeX(pt.time, now, dims.width);
                    const py = getPriceY(pt.price, cam, dims.height, step);
                    ctx.lineTo(Math.min(px, tx), py);
                    if (px < -50) break;
                }
                ctx.stroke();
                ctx.fillStyle = "#3ef4ff"; ctx.beginPath(); ctx.arc(tx, currentY, 3, 0, Math.PI * 2); ctx.fill();
            }

            // D. Blue Center Marker
            ctx.strokeStyle = "rgba(8, 183, 247, 0.5)"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(Math.round(tx), 0); ctx.lineTo(Math.round(tx), dims.height); ctx.stroke();
        }
      }
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [dimensions]);

  const priceLevels = useMemo(() => {
    const state = useGameStore.getState();
    const cam = cameraPriceRef.current || currentPrice;
    const step = state.modePriceStep;
    const startP = Math.floor((cam - 6 * step) / step) * step;
    const levels = [];
    for (let i = 0; i <= 15; i++) levels.push(startP + i * step);
    return levels;
  }, [selectedMarketId, currentPrice]);

  return (
    <div className={cn("flex-1 flex flex-col relative overflow-hidden font-mono h-full w-full", isMaximized && "fixed inset-0 z-[9999] bg-black/95 p-6")}>
      <div className="h-full w-full flex">
        <div className="relative h-full w-[97%] flex items-center justify-center">
          
          {/* Live Price Header - Maximized View */}
          {isMaximized && (
            <div className="absolute top-2 left-4 z-[100]">
              <div className="h-11 px-4 rounded-md flex items-center gap-2.5 bg-[#3ef5ff45] backdrop-blur-md border border-white/10">
                <div className="flex flex-row">
                  <span className="text-[11px] tracking-[0.16em] font-bold text-[#7AA8B5] uppercase">{selectedMarketLabel.split("/")[0]}</span>
                  <span className="text-[11px] tracking-[0.16em] font-bold text-[#7AA8B5] mx-1">/</span>
                  <span className="text-[11px] tracking-[0.12em] font-semibold text-[#5F9BA6]">USDT</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold font-mono text-[#2EBD85]">${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <span className="flex h-1.5 w-1.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EBD85] opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2EBD85]" /></span>
                </div>
              </div>
            </div>
          )}

          <div ref={containerRef} className="flex-1 relative overflow-hidden mr-10 sm:mr-14 w-full h-full">
            <canvas ref={staticCanvasRef} className="absolute inset-0 z-[5]" />
            <canvas ref={motionCanvasRef} className="absolute inset-0 z-[10]" />
            <div 
                className="absolute inset-0 z-[20] cursor-crosshair" 
                onMouseMove={(e) => handleMouseMove(e.clientX, e.clientY)}
                onMouseLeave={() => { hoverCellId.current = null; }}
                onClick={(e) => handleInteraction(e.clientX, e.clientY)} 
            />
          </div>
          <button onClick={() => setIsMaximized(!isMaximized)} className="absolute bottom-2 left-2 z-[50] w-10 h-10 rounded-md flex items-center justify-center bg-white/6 hover:bg-white/10 border border-white/6" style={{ background: "rgba(36, 93, 118, 0.45)", backdropFilter: "blur(6px)" }}>
            {isMaximized ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

        {/* Right Section - Stylized Price Sidebar */}
        <div className="flex justify-center items-center relative w-[3%] h-full">
          <div
            className="absolute right-0 top-0 bottom-0 w-12 sm:w-18 pointer-events-none z-10"
            style={{
              background: "linear-gradient(180deg, rgba(27, 87, 96, 0.4), rgba(22, 39, 43, 0.3))",
              borderLeft: "1px solid rgba(62, 244, 255, 0.05)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}
          >
            {priceLevels.map((p) => {
              const y = getPriceY(p, cameraPriceRef.current || currentPrice, dimensions.height, useGameStore.getState().modePriceStep);
              if (y < -10 || y > dimensions.height + 10) return null;
              return (
                <div key={p} className="absolute w-full text-[9px] font-bold text-white/60 text-right pr-3" style={{ top: y, transform: "translateY(-50%)" }}>
                  {p.toFixed(2)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
