export interface FrontendMarket {
  id: string;
  label: string;
  priceStep: number;
}

/**
 * When `VITE_CARNOT_MARKETS_JSON` omits `priceStep`, infer band size from id.
 * Must match backend `priceCellSize` in carnot-backend `market-registry.ts`
 * or grid cells stack (same ~$85 level with a $25 step = collapsed UI).
 */
export function defaultPriceStepForMarketId(marketId: string): number {
  const id = marketId.toLowerCase();
  if (id.startsWith("btc")) return 25;
  if (id.startsWith("jup")) return 1;
  return 0.1;
}

const DEFAULT_MARKETS: FrontendMarket[] = [
  { id: "btcusdt", label: "BTC/USDT", priceStep: 25 },
  { id: "jupusdt", label: "JUP/USDT", priceStep: 0.1 },
  { id: "solusdt", label: "SOL/USDT", priceStep: 0.1 },
];

function parseMarkets(raw?: string): FrontendMarket[] {
  if (!raw) return DEFAULT_MARKETS;
  try {
    const parsed = JSON.parse(raw) as Array<Partial<FrontendMarket>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MARKETS;
    const normalized = parsed
      .filter((m) => m.id && m.label)
      .map((m) => {
        const mid = String(m.id).toLowerCase();
        const step =
          typeof m.priceStep === "number" &&
          Number.isFinite(m.priceStep) &&
          m.priceStep > 0
            ? m.priceStep
            : defaultPriceStepForMarketId(mid);
        return {
          id: mid,
          label: String(m.label),
          priceStep: step,
        };
      });
    return normalized.length > 0 ? normalized : DEFAULT_MARKETS;
  } catch {
    return DEFAULT_MARKETS;
  }
}

export const FRONTEND_MARKETS = parseMarkets(
  import.meta.env.VITE_CARNOT_MARKETS_JSON as string | undefined,
);

export const DEFAULT_MARKET_ID =
  ((import.meta.env.VITE_DEFAULT_MARKET_ID as string | undefined)?.toLowerCase() ??
    FRONTEND_MARKETS[0]?.id ??
    "btcusdt");

export function getMarketLabel(marketId: string): string {
  return (
    FRONTEND_MARKETS.find((m) => m.id === marketId.toLowerCase())?.label ??
    marketId.toUpperCase()
  );
}

/** Price cell height for grid math; matches backend market registry when configured. */
export function getMarketPriceStep(marketId: string): number {
  const id = marketId.toLowerCase();
  const step = FRONTEND_MARKETS.find((m) => m.id === id)?.priceStep;
  return typeof step === "number" && Number.isFinite(step) && step > 0
    ? step
    : defaultPriceStepForMarketId(id);
}
