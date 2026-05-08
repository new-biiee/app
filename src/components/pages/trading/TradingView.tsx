import React, { useEffect, useState } from "react";
import { TradingGrid } from "./TradingGrid";
import { useGameStore } from "../../../store/store";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOrderControllerGetUserOrders } from "../../../services/queries";
import { ComingSoon } from "../fallback/ComingSoon";
import { AlertTriangle, ChartCandlestick, Layers2, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const truncateAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const TradingView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"pool" | "social">("pool");
  const [isHoveringWarning, setIsHoveringWarning] = useState(false);
  const ensureCells = useGameStore((state) => state.ensureCells);
  const tickTime = useGameStore((state) => state.tickTime);
  const setOpenBets = useGameStore((state) => state.setOpenBets);
  const selectedMarketId = useGameStore((state) => state.selectedMarketId);
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58();
  const demoWinFeed = useGameStore((state) => state.demoWinFeed);
  const setDemoWinFeed = useGameStore((state) => state.setDemoWinFeed);

  const BRAND_ACCENT = "#3ef4ff";

  const { data: openOrdersData } = useOrderControllerGetUserOrders(
    {
      limit: 100,
      offset: 0,
      marketId: selectedMarketId,
    } as unknown as Parameters<typeof useOrderControllerGetUserOrders>[0],
    {
      query: {
        enabled: !!address,
        queryKey: ["open-orders", address, selectedMarketId],
      },
    },
  );

  useEffect(() => {
    setOpenBets([]);
  }, [selectedMarketId, setOpenBets]);

  useEffect(() => {
    if (openOrdersData && Array.isArray(openOrdersData)) {
      setOpenBets(openOrdersData);
    }
  }, [openOrdersData, setOpenBets]);

  useEffect(() => {
    // Generate initial grid and start simulation
    ensureCells();

    // Mock grid tick every 1000ms
    const tickInterval = setInterval(() => {
      tickTime();
    }, 1000);

    return () => {
      clearInterval(tickInterval);
    };
  }, [ensureCells, tickTime]);

  useEffect(() => {
    if (!demoWinFeed) return;
    const t = setTimeout(() => setDemoWinFeed(null), 4500);
    return () => clearTimeout(t);
  }, [demoWinFeed, setDemoWinFeed]);

  const shouldShowTradingGrid =
    activeMode === "pool" &&
    (selectedMarketId === "solusdt" || selectedMarketId === "btcusdt");
  const comingSoonType =
    activeMode === "social" || selectedMarketId !== "jupusdt"
      ? "social-trading"
      : "jupiter-market";
  const activePanelKey = shouldShowTradingGrid ? "grid" : comingSoonType;

  return (
    <div className="relative overflow-hidden h-full w-full">
      <div className="absolute top-0 left-0 z-40 flex items-center gap-3">
        <motion.div
          className="inline-flex rounded-2xl border p-1 backdrop-blur-md"
          style={{
            borderColor: "rgba(62, 244, 255, 0.16)",
          }}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <motion.button
            type="button"
            onClick={() => setActiveMode("pool")}
            className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              color: activeMode === "pool" ? BRAND_ACCENT : "rgba(255,255,255,0.62)",
            }}
          >
            {activeMode === "pool" && (
              <motion.div
                layoutId="trading-mode-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(62, 244, 255, 0.1)",
                  border: "1px solid rgba(62, 244, 255, 0.18)",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <Layers2 size={16} className="relative z-10" />
            <span className="relative z-10">Pool Trading</span>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveMode("social")}
            className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              color: activeMode === "social" ? BRAND_ACCENT : "rgba(255,255,255,0.62)",
            }}
          >
            {activeMode === "social" && (
              <motion.div
                layoutId="trading-mode-pill"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "rgba(62, 244, 255, 0.1)",
                  border: "1px solid rgba(62, 244, 255, 0.18)",
                }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <ChartCandlestick size={16} className="relative z-10" />
            <span className="relative z-10">Social Trading</span>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {selectedMarketId === "solusdt" && (
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onMouseEnter={() => setIsHoveringWarning(true)}
                onMouseLeave={() => setIsHoveringWarning(false)}
                className="cursor-help p-2 rounded-xl border flex items-center justify-center backdrop-blur-md transition-colors"
                style={{
                  borderColor: "rgba(234, 179, 8, 0.24)",
                  background: "rgba(234, 179, 8, 0.08)",
                }}
              >
                <AlertTriangle size={22} className="text-yellow-500" />
              </motion.div>

              <AnimatePresence>
                {isHoveringWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 left-0 z-50 w-[380px] rounded-2xl border p-4 backdrop-blur-xl pointer-events-none"
                    style={{
                      backgroundColor: "rgba(209, 126, 85, 0.16)",
                      borderColor: "rgba(234, 179, 8, 0.3)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white/95 mb-1">
                          Solana Market Beta
                        </h4>
                        <p className="text-[12px] leading-relaxed text-white/60">
                          Parameters for this market are currently under development and not yet fine-tuned.
                          Please trade with caution.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>

      {shouldShowTradingGrid ? (
        <div className="flex-1 flex flex-col relative overflow-hidden h-full">
          {demoWinFeed ? (
            <div className="pointer-events-none absolute left-3 top-3 z-30 sm:left-4 sm:top-4">
              <div
                key={demoWinFeed.id}
                className="wallet-win-toast w-fit rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 backdrop-blur-md ml-3 mt-3"
                style={{
                  background: "rgba(11, 16, 28, 0.8)",
                  borderColor: "rgba(46, 189, 133, 0.4)",
                  boxShadow:
                    "0 4px 12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(46, 189, 133, 0.1)",
                }}
              >
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center">
                    <Trophy className="h-4 w-4" color={BRAND_ACCENT} />
                  </div>

                  <span className="text-[13px] font-medium leading-none text-white/90 sm:text-[14px]">
                    {truncateAddress(demoWinFeed.user)}
                  </span>

                  <span className="text-[13px] font-bold leading-none text-bn-green sm:text-[14px]">
                    +${demoWinFeed.amount}
                  </span>

                  <span className="rounded bg-bn-green/20 px-1.5 py-0.5 text-[10px] font-bold leading-none text-bn-green sm:text-[11px]">
                    WIN
                  </span>
                </div>
              </div>
            </div>
          ) : null}
          <TradingGrid />
        </div>
      ) : (
        <motion.div
          key={activePanelKey}
          className="h-full"
          initial={{ opacity: 0, y: 18, scale: 0.985, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, scale: 0.985, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <ComingSoon type={comingSoonType} />
        </motion.div>
      )}
    </div>
  );
};
