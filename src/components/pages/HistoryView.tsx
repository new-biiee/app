import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  History,
  Wallet,
  Target,
  Scale,
  Percent,
  Bitcoin,
  CircleDollarSign,
  Gem,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { BACKEND_URL } from "../../constant";
import { useGameStore } from "../../store/store";
import { getMarketLabel } from "../../config/markets";
import { SolanaSVGLogo } from "../../constant/solana_logo";
import { JupiterLogo } from "../../constant/Jupiter_logo";

const USDT_DECIMALS = 6;

function microToUsdt(micro: string | number | undefined | null): number {
  if (micro == null || micro === "") return 0;
  const n = typeof micro === "number" ? micro : parseFloat(String(micro));
  if (!Number.isFinite(n)) return 0;
  return n / 10 ** USDT_DECIMALS;
}

function fmtUsd(n: number, opts?: { signed?: boolean; maxFrac?: number }) {
  const { signed = false, maxFrac = 2 } = opts ?? {};
  const abs = Math.abs(n).toLocaleString(undefined, {
    maximumFractionDigits: maxFrac,
  });
  if (!signed) return `$${abs}`;
  if (n > 0) return `+$${abs}`;
  if (n < 0) return `-$${abs}`;
  return `$${abs}`;
}

interface PortfolioStats {
  portfolio: {
    freeMicro: string;
    lockedMicro: string;
    freeTapMicro: string;
    totalMicro: string;
  };
  trading: {
    settledCount: number;
    wins: number;
    losses: number;
    totalBetMicro: string;
    totalLostStakeMicro: string;
    totalWinPayoutMicro: string;
    netPnlMicro: string;
  };
  leaderboard: {
    rank: number | null;
    totalRankedUsers: number;
    netPnlMicro: string;
  };
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  valueTone?: "default" | "gain" | "loss" | "accent";
}

const SummaryTile: React.FC<SummaryTileProps> = ({
  icon,
  label,
  value,
  hint,
  valueTone = "default",
}) => {
  const BRAND_ACCENT = "#3ef4ff";
  const color =
    valueTone === "gain"
      ? "#2EBD85"
      : valueTone === "loss"
        ? "#F6465D"
        : valueTone === "accent"
          ? BRAND_ACCENT
          : "#ffffff";
  return (
    <div
      className="rounded-2xl border p-4 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, rgba(9, 29, 35, 0.5) 0%, rgba(6, 7, 8, 0.55) 100%)",
        borderColor: "rgba(62, 244, 255, 0.14)",
        boxShadow: "inset 0 1px 0 rgba(62, 244, 255, 0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="opacity-90" style={{ color: BRAND_ACCENT }}>
          {icon}
        </span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "#7AA8B5" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-xl font-black font-mono tracking-tight"
        style={{ color }}
      >
        {value}
      </p>
      {hint ? (
        <p
          className="text-[11px] mt-1.5 font-medium leading-snug"
          style={{ color: "#7AA8B5" }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
};

interface Order {
  orderId?: string;
  settledAt?: string;
  createdAt?: string;
  placedAt?: number | string;
  cellTimeStart?: number | string;
  cellTimeEnd?: number | string;
  marketId?: string;
  rewardRate?: string | number;
  amount: string | number;
  settledWin?: boolean | null;
  status?: string;
  direction?: "UP" | "DOWN";
  lowerPrice?: string | number;
  upperPrice?: string | number;
  entryPrice?: string | number;
  exitPrice?: string | number;
  multiplierBps?: number;
}

interface SettlementBatchEvent {
  batchId?: string;
  marketId?: string;
  status?: string;
  windowStart?: string | number;
  windowEnd?: string | number;
  onchainTxHash?: string;
}

interface OrderBatchMeta {
  batchId: string | null;
  batchStatus: string | null;
  onchainTxHash: string | null;
  windowEndMs: number | null;
}

function parseTsMs(value: string | number | undefined): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    // Backend may return seconds or milliseconds depending on source.
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const parsedNum = Number(value);
  if (Number.isFinite(parsedNum)) {
    return parsedNum < 1_000_000_000_000 ? parsedNum * 1000 : parsedNum;
  }
  const parsedDate = Date.parse(String(value));
  return Number.isFinite(parsedDate) ? parsedDate : null;
}

function toExplorerTxUrl(hash: string): string {
  return hash.startsWith("0x")
    ? `https://sepolia.etherscan.io/tx/${hash}`
    : `https://explorer.solana.com/tx/${hash}?cluster=devnet`;
}

function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return "Any moment";
  const totalSec = Math.ceil(msLeft / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function normalizeMarketId(value: string | undefined | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Matches icon logic in Layout header market picker */
function marketIconFor(marketId: string) {
  const id = marketId.toLowerCase();
  if (id.startsWith("btc")) return <Bitcoin size={14} />;
  if (id.startsWith("jup")) return <JupiterLogo className="w-4 h-4" />;
  if (id.startsWith("sol")) return <SolanaSVGLogo className="w-3 h-3" />;
  if (id.includes("usd")) return <CircleDollarSign size={14} />;
  return <Gem size={14} />;
}

function formatBandPrice(
  n: string | number | undefined,
  marketId: string,
): string {
  if (n == null || n === "") return "—";
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (!Number.isFinite(num)) return "—";
  const isBtc = marketId.toLowerCase().startsWith("btc");
  return isBtc
    ? `$${Math.round(num).toLocaleString()}`
    : `$${num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
}

function formatPriceRange(order: Order, marketId: string): string {
  const lo = order.lowerPrice;
  const hi = order.upperPrice;
  if (lo == null && hi == null) return "—";
  const a = formatBandPrice(lo, marketId);
  const b = formatBandPrice(hi, marketId);
  if (a === "—" && b === "—") return "—";
  if (a === "—") return b;
  if (b === "—") return a;
  return `${a} – ${b}`;
}

function calcPayout(order: Order): number | null {
  if (order.settledWin !== true) return null;
  const stake = microToUsdt(order.amount);
  const rate = Number(order.rewardRate ?? 0);
  if (!rate) return null;
  return stake * rate;
}

const DirectionBadge = ({ dir }: { dir?: string }) =>
  dir === "UP" ? (
    <span style={{ color: "#2EBD85" }}>▲ UP</span>
  ) : dir === "DOWN" ? (
    <span style={{ color: "#F6465D" }}>▼ DOWN</span>
  ) : (
    <span style={{ color: "#7AA8B5" }}>—</span>
  );

export const HistoryView: React.FC = () => {
  const selectedMarketId = useGameStore((state) => state.selectedMarketId);
  const selectedMarketLabel = getMarketLabel(selectedMarketId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderBatchMeta, setOrderBatchMeta] = useState<
    Record<string, OrderBatchMeta>
  >({});
  const [settlementNowTick, setSettlementNowTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  );
  const [page, setPage] = useState(0);
  const BRAND_ACCENT = "#3ef4ff";
  const BRAND_GREEN = "#2EBD85";

  useEffect(() => {
    const id = window.setInterval(() => {
      setSettlementNowTick((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const buildOrderBatchMeta = useCallback(
    async (nextOrders: Order[], token: string) => {
      if (nextOrders.length === 0) {
        setOrderBatchMeta({});
        return;
      }

      const orderTimes = nextOrders
        .map((o) => parseTsMs(o.settledAt ?? o.createdAt ?? o.placedAt))
        .filter((n): n is number => n != null);

      if (orderTimes.length === 0) {
        setOrderBatchMeta({});
        return;
      }

      const minTsSec = Math.floor(Math.min(...orderTimes) / 1000) - 1800;
      const maxTsSec = Math.floor(Math.max(...orderTimes) / 1000) + 1800;

      const res = await axios.get(
        `${BACKEND_URL}/api/v1/worker/events/settlement-batches?fromTimestamp=${minTsSec}&toTimestamp=${maxTsSec}&page=1&pageSize=500`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        },
      );

      const rows = (res.data?.data ?? []) as SettlementBatchEvent[];
      const byOrder: Record<string, OrderBatchMeta> = {};

      for (const order of nextOrders) {
        const orderKey =
          order.orderId ??
          `${order.marketId ?? "m"}:${order.settledAt ?? order.createdAt ?? "na"}`;
        const settledMs = parseTsMs(order.settledAt);
        if (!settledMs) {
          byOrder[orderKey] = {
            batchId: null,
            batchStatus: null,
            onchainTxHash: null,
            windowEndMs: null,
          };
          continue;
        }

        const match = rows.find((batch) => {
          const batchMarket = normalizeMarketId(batch.marketId);
          const orderMarket = normalizeMarketId(order.marketId);
          if (batchMarket && orderMarket && batchMarket !== orderMarket)
            return false;
          const wStart = parseTsMs(batch.windowStart);
          const wEnd = parseTsMs(batch.windowEnd);
          if (wStart == null || wEnd == null) return false;
          return settledMs >= wStart && settledMs < wEnd;
        });

        byOrder[orderKey] = {
          batchId: match?.batchId ?? null,
          batchStatus: match?.status ?? null,
          onchainTxHash: match?.onchainTxHash ?? null,
          windowEndMs: parseTsMs(match?.windowEnd),
        };
      }

      setOrderBatchMeta(byOrder);
    },
    [],
  );

  const fetchHistory = async (pageIdx: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const limit = 20;
      const offset = pageIdx * limit;
      const marketParam = encodeURIComponent(selectedMarketId);
      const res = await axios.get(
        `${BACKEND_URL}/api/orders/user?limit=${limit}&offset=${offset}&marketId=${marketParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        },
      );
      const data = res.data?.data || res.data;
      const nextOrders = Array.isArray(data) ? data : [];
      setOrders(nextOrders);
      await buildOrderBatchMeta(nextOrders, token);
    } catch (err) {
      console.error(err);
      setOrderBatchMeta({});
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    try {
      const marketParam = encodeURIComponent(selectedMarketId);
      const res = await axios.get(
        `${BACKEND_URL}/api/orders/user/stats?marketId=${marketParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        },
      );
      const body = res.data?.data ?? res.data;
      if (body && typeof body === "object" && "portfolio" in body) {
        setStats(body as PortfolioStats);
      } else {
        setStats(null);
      }
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedMarketId]);

  useEffect(() => {
    setPage(0);
  }, [selectedMarketId]);

  useEffect(() => {
    setAuthToken(
      typeof window !== "undefined" ? localStorage.getItem("token") : null,
    );
    fetchHistory(page);
    void fetchPortfolioStats();
  }, [page, fetchPortfolioStats, selectedMarketId]);

  const TH_BACKGROUND = "rgb(54, 139, 143)";

  return (
    <div className="flex-1 flex flex-col p-1 sm:p-3 relative min-h-0 h-full">
      <div
        className="absolute inset-3 sm:inset-5 pointer-events-none rounded-3xl"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(62, 244, 255, 0.08) 0%, rgba(62, 244, 255, 0) 22%), radial-gradient(circle at 82% 70%, rgba(46, 189, 133, 0.10) 0%, rgba(46, 189, 133, 0) 24%), linear-gradient(135deg, rgba(2, 5, 8, 0.65) 0%, rgba(6, 14, 18, 0.4) 45%, rgba(2, 5, 8, 0.72) 100%)",
        }}
      />
      <div
        className="flex-1 flex flex-col overflow-auto relative z- rounded-2xl border"
        style={{
          background: "rgba(4, 9, 12, 0.22)",
          borderColor: "rgba(62, 244, 255, 0.16)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(62, 244, 255, 0.08), inset 0 -1px 0 rgba(46, 189, 133, 0.08)",
        }}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b" style={{ borderColor: "rgba(62, 244, 255, 0.12)" }}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(62, 244, 255, 0.16) 0%, rgba(46, 189, 133, 0.12) 100%)",
                border: "1px solid rgba(62, 244, 255, 0.24)",
                boxShadow: "0 0 18px rgba(62, 244, 255, 0.16)",
              }}
            >
              <History size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: BRAND_ACCENT }} />
            </div>
            <div className="min-w-0">
              <h2
                className="text-sm sm:text-base font-bold sm:font-semibold text-white truncate"
              >
                Trading History
              </h2>
              <p className="hidden sm:block text-xs font-medium" style={{ color: "#7AA8B5" }}>
                Settled orders and reward outcomes for {selectedMarketLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] px-2 py-1 font-semibold rounded-md"
              style={{
                color: "#ffffff",
                background: "rgba(62, 244, 255, 0.08)",
                border: "1px solid rgba(62, 244, 255, 0.22)",
              }}
            >
              <span className="opacity-90" style={{ color: BRAND_ACCENT }}>
                {marketIconFor(selectedMarketId)}
              </span>
              <span className="font-mono tracking-tight hidden xs:inline">
                [ {selectedMarketLabel} ]
              </span>
            </span>
            <span
              className="text-[9px] sm:text-[11px] px-2 py-1 font-semibold uppercase tracking-[0.1em] sm:tracking-[0.18em] rounded-md"
              style={{
                color: BRAND_GREEN,
                background: "rgba(46, 189, 133, 0.10)",
                border: "1px solid rgba(46, 189, 133, 0.22)",
              }}
            >
              History
            </span>
          </div>
        </div>

        <div className="px-4 sm:px-5 pb-4">
          <h3
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3 mt-4"
            style={{ color: "#7AA8B5" }}
          >
            Portfolio & performance
          </h3>
          {!authToken ? (
            <p
              className="text-sm font-medium px-1 py-6 text-center rounded-xl border"
              style={{
                color: "#9aa8b0",
                borderColor: "rgba(62, 244, 255, 0.12)",
              }}
            >
              Sign in to load portfolio, PnL, and leaderboard rank.
            </p>
          ) : statsLoading && !stats ? (
            <div className="flex justify-center py-10">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: BRAND_ACCENT }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              <SummaryTile
                icon={<Wallet size={16} strokeWidth={2.2} />}
                label="Portfolio"
                value={fmtUsd(
                  stats ? microToUsdt(stats.portfolio.totalMicro) : 0,
                )}
                hint="Total Balance"
                valueTone="accent"
              />
              <SummaryTile
                icon={<Target size={16} strokeWidth={2.2} />}
                label="Total bet"
                value={fmtUsd(
                  stats ? microToUsdt(stats.trading.totalBetMicro) : 0,
                )}
                hint={
                  stats ? `${stats.trading.settledCount} settled` : "—"
                }
              />
              <SummaryTile
                icon={<Scale size={16} strokeWidth={2.2} />}
                label="PnL (net)"
                value={
                  stats
                    ? fmtUsd(microToUsdt(stats.trading.netPnlMicro), {
                        signed: true,
                        maxFrac: 2,
                      })
                    : "$0.00"
                }
                hint="Profit/Loss"
                valueTone={
                  stats
                    ? microToUsdt(stats.trading.netPnlMicro) > 0
                      ? "gain"
                      : microToUsdt(stats.trading.netPnlMicro) < 0
                        ? "loss"
                        : "default"
                    : "default"
                }
              />
              <SummaryTile
                icon={<Percent size={16} strokeWidth={2.2} />}
                label="Win rate"
                value={
                  stats && stats.trading.settledCount > 0
                    ? `${((stats.trading.wins / stats.trading.settledCount) * 100).toFixed(1)}%`
                    : "—"
                }
                hint="Overall Performance"
                valueTone={
                  stats && stats.trading.settledCount > 0
                    ? stats.trading.wins / stats.trading.settledCount >= 0.5
                      ? "gain"
                      : "loss"
                    : "default"
                }
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto w-full">
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-4 px-4 pb-10">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_ACCENT }} />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center text-sm font-mono opacity-50">No order history found.</div>
            ) : (
              orders.map((order, i) => (
                <div 
                  key={i} 
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(62, 244, 255, 0.12)",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="opacity-70">{marketIconFor(order.marketId ?? selectedMarketId)}</span>
                      <span className="text-xs font-bold font-mono text-white">
                        {order.settledAt ? format(new Date(order.settledAt), "HH:mm:ss") : "-"}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[10px] font-black tracking-widest rounded uppercase"
                      style={{
                        background: order.settledWin === true ? "rgba(46,189,133,0.12)" : order.settledWin === false ? "rgba(246,70,93,0.12)" : "rgba(255,255,255,0.06)",
                        color: order.settledWin === true ? "#2EBD85" : order.settledWin === false ? "#F6465D" : "#d0d0d0",
                      }}
                    >
                      {order.settledWin === true ? "WIN" : order.settledWin === false ? "LOSE" : order.status || "PENDING"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5">Direction</p>
                      <div className="text-xs font-bold"><DirectionBadge dir={order.direction} /></div>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5">Stake</p>
                      <p className="text-xs font-black font-mono" style={{ color: BRAND_ACCENT }}>{fmtUsd(microToUsdt(order.amount))}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5">Price Range</p>
                      <p className="text-[10px] font-mono opacity-80">{formatPriceRange(order, order.marketId ?? selectedMarketId)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-40 mb-0.5">Payout</p>
                      <p className="text-xs font-black font-mono">
                        {order.settledWin === true ? (
                          <span style={{ color: "#2EBD85" }}>{fmtUsd(calcPayout(order) ?? microToUsdt(order.amount) * Number(order.rewardRate ?? 0))}</span>
                        ) : order.settledWin === false ? (
                          <span style={{ color: "#F6465D" }}>$0.00</span>
                        ) : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Batch Info */}
                  {(() => {
                    const orderKey = order.orderId ?? `${order.marketId ?? "m"}:${order.settledAt ?? order.createdAt ?? "na"}`;
                    const batchMeta = orderBatchMeta[orderKey];
                    if (batchMeta?.onchainTxHash) {
                      return (
                        <div className="pt-2 border-t border-white/5">
                           <a href={toExplorerTxUrl(batchMeta.onchainTxHash)} target="_blank" rel="noreferrer" 
                              className="text-[9px] font-mono opacity-50 truncate block hover:opacity-100 transition-opacity underline decoration-dotted">
                             Tx: {batchMeta.onchainTxHash}
                           </a>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-center border-separate border-spacing-0 min-w-[720px] mx-auto">
            <thead className="z-10">
              <tr
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#d5dde0",
                }}
              >
                <th
                  className="sticky top-0 z-20 py-4 px-4 whitespace-nowrap"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Settled Date
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 whitespace-nowrap"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Direction
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 whitespace-nowrap"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Price Range
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 whitespace-nowrap"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Reward Rate
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Batch Settlement
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 text-center"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Stake
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 text-center whitespace-nowrap"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Payout
                </th>
                <th
                  className="sticky top-0 z-20 py-4 px-4 text-center"
                  style={{
                    background: TH_BACKGROUND,
                    borderBottom: "1px solid rgba(62, 244, 255, 0.08)",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2
                      className="w-8 h-8 animate-spin mx-auto"
                      style={{ color: BRAND_ACCENT }}
                    />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-20 text-center text-md"
                    style={{
                      fontFamily: "monospace",
                      color: "rgba(241, 252, 255, 0.73)",
                    }}
                  >
                    No order history found.
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{
                      borderBottom: "1px solid rgba(62, 244, 255, 0.06)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "linear-gradient(90deg, rgba(62,244,255,0.03) 0%, rgba(46,189,133,0.04) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                    }}
                  >
                    <td
                      className="py-4 px-4 text-sm whitespace-nowrap"
                      style={{ color: "#d0d0d0" }}
                    >
                      {order.settledAt
                        ? format(new Date(order.settledAt), "MMM d, HH:mm:ss")
                        : order.createdAt
                          ? format(new Date(order.createdAt), "MMM d, HH:mm:ss")
                          : "-"}
                    </td>
                    <td
                      className="py-4 px-4 text-sm whitespace-nowrap"
                      style={{ color: "#ffffff" }}
                    >
                      <DirectionBadge dir={order.direction} />
                    </td>
                    <td
                      className="py-4 px-4 text-xs font-mono whitespace-nowrap"
                      style={{ color: "#d0d0d0" }}
                    >
                      {formatPriceRange(
                        order,
                        order.marketId ?? selectedMarketId,
                      )}
                    </td>
                    <td
                      className="py-4 px-4 text-sm font-mono whitespace-nowrap"
                      style={{ color: "#ffffff" }}
                    >
                      {order.rewardRate
                        ? Number(order.rewardRate).toFixed(3) + "x"
                        : "-"}
                    </td>
                    <td
                      className="py-4 px-4 text-xs leading-relaxed text-center"
                      style={{ color: "#d0d0d0", minWidth: "250px" }}
                    >
                      {(() => {
                        const orderKey =
                          order.orderId ??
                          `${order.marketId ?? "m"}:${order.settledAt ?? order.createdAt ?? "na"}`;
                        const batchMeta = orderBatchMeta[orderKey];
                        const countdownTargetMs =
                          batchMeta?.windowEndMs ??
                          parseTsMs(order.cellTimeEnd) ??
                          parseTsMs(order.settledAt) ??
                          Date.now();
                        const msLeft = countdownTargetMs - Date.now();
                        void settlementNowTick;

                        if (batchMeta?.onchainTxHash) {
                          return (
                            <div
                              className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium"
                              style={{
                                background: "rgba(255, 180, 80, 0.12)",
                                border: "1px solid rgba(255, 180, 80, 0.35)",
                                color: "#e8d4b8",
                              }}
                            >
                              <a
                                href={toExplorerTxUrl(batchMeta.onchainTxHash)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono underline decoration-dotted"
                                style={{ color: "#ffffff" }}
                              >
                                {batchMeta.onchainTxHash}
                              </a>
                            </div>
                          );
                        }

                        if (
                          order.settledAt ||
                          order.status === "SETTLED" ||
                          batchMeta?.batchStatus
                        ) {
                          return (
                            <div
                              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
                              style={{
                                background: "rgba(255, 180, 80, 0.12)",
                                border: "1px solid rgba(255, 180, 80, 0.35)",
                                color: "#e8d4b8",
                              }}
                            >
                              <span>Batch settlement in progress</span>
                              <strong
                                className="font-mono"
                                style={{ color: "#ffffff" }}
                              >
                                {formatCountdown(msLeft)}
                              </strong>
                            </div>
                          );
                        }

                        return (
                          <div
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
                            style={{
                              background: "rgba(255, 180, 80, 0.12)",
                              border: "1px solid rgba(255, 180, 80, 0.35)",
                              color: "#e8d4b8",
                            }}
                          >
                            <span>Batch settlement in progress</span>
                            <strong
                              className="font-mono"
                              style={{ color: "#ffffff" }}
                            >
                              {formatCountdown(msLeft)}
                            </strong>
                          </div>
                        );
                      })()}
                    </td>
                    <td
                      className="py-4 px-4 font-bold text-center whitespace-nowrap font-mono"
                      style={{ color: BRAND_ACCENT }}
                    >
                      {fmtUsd(microToUsdt(order.amount))}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap font-mono text-sm font-semibold">
                      {order.settledWin === true ? (
                        <span style={{ color: "#2EBD85" }}>
                          {fmtUsd(
                            calcPayout(order) ??
                              microToUsdt(order.amount) *
                                Number(order.rewardRate ?? 0),
                          )}
                        </span>
                      ) : order.settledWin === false ? (
                        <span style={{ color: "#F6465D" }}>–$0.00</span>
                      ) : (
                        <span style={{ color: "#7AA8B5" }}>—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={cn("px-3 py-1 text-xs font-semibold")}
                        style={{
                          borderRadius: "4px",
                          background:
                            order.settledWin === true
                              ? "rgba(46,189,133,0.12)"
                              : order.settledWin === false
                                ? "rgba(246,70,93,0.12)"
                                : "rgba(255,255,255,0.06)",
                          color:
                            order.settledWin === true
                              ? "#2EBD85"
                              : order.settledWin === false
                                ? "#F6465D"
                                : "#d0d0d0",
                        }}
                      >
                        {order.settledWin === true
                          ? "WIN"
                          : order.settledWin === false
                            ? "LOSE"
                            : order.status || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          className="flex items-center justify-between px-5 py-4 mt-auto"
          style={{ borderTop: "1px solid rgba(62, 244, 255, 0.10)" }}
        >
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center rounded-xl gap-1 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              color: BRAND_ACCENT,
              background:
                "linear-gradient(90deg, rgba(62, 244, 255, 0.16) 0%, rgba(46, 189, 133, 0.14) 100%)",
              border: "1px solid rgba(62, 244, 255, 0.28)",
            }}
          >
            <span className="relative z-10 flex items-center gap-1">
              <ChevronLeft size={15} /> Previous
            </span>
          </button>
          <span
            className="text-md font-medium mr-4"
            style={{ color: "#d0d0d0", fontFamily: "monospace" }}
          >
            Page {page + 1}
          </span>
          <button
            disabled={orders.length !== 20 || loading}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center rounded-xl gap-1 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{
              color: BRAND_ACCENT,
              background:
                "linear-gradient(90deg, rgba(62, 244, 255, 0.16) 0%, rgba(46, 189, 133, 0.14) 100%)",
              border: "1px solid rgba(62, 244, 255, 0.28)",
            }}
          >
            <span className="relative z-10 flex items-center gap-1">
              Next <ChevronRight size={15} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
