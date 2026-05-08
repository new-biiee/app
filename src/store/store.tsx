import { create } from "zustand";
import toast from "react-hot-toast";
import type { Socket } from "socket.io-client";
import { DEFAULT_MARKET_ID, getMarketPriceStep } from "../config/markets";
export interface PricePoint {
  time: number; // timestamp
  price: number;
}

export interface CellData {
  id: string;
  timeWindowStart: number;
  timeWindowEnd: number;
  priceLevel: number; // The price band (e.g. 50020, 50040)
  multiplier: number;
  status: "active" | "past" | "hit";
  original: RemoteCell;
}

export interface RemoteCell {
  gridTs: number;
  startTs: number;
  endTs: number;
  lowerPrice: string;
  upperPrice: string;
  rewardRate: string;
  gridSignature: string;
}

interface GameState {
  selectedMarketId: string;
  balance: number;
  serverBalance: number;
  currentPrice: number;
  history: PricePoint[];
  cells: CellData[];
  basePrice: number;
  nextSessionTime: number;
  modeIntervalSeconds: number;
  modePriceStep: number;
  bets: Record<string, number>;
  betRates: Record<string, number>;
  pendingBets: Record<string, number>;
  pendingWins: Record<string, number>;
  socket: Socket | null;
  wssKey: string | null;
  betAmount: number;
  isDemoMode: boolean;
  demoAddress: string | null;
  serverTimeOffset: number; // diff between server ts and local Date.now()
  demoWinFeed: { id: number; user: string; amount: string } | null;
  setDemoWinFeed: (v: { id: number; user: string; amount: string } | null) => void;
  setSelectedMarketId: (marketId: string) => void;

  setConnection: (socket: Socket | null, wssKey: string | null) => void;
  updatePrice: (price: number, serverTs?: number) => void;
  syncServerTime: (serverTs: number) => void;
  placeBet: (cellId: string, amount: number) => void;
  ensureCells: () => void;
  tickTime: () => void;
  updateGrid: (newCells: RemoteCell[]) => void;
  updateBalance: (balance: number) => void;
  setBetAmount: (amount: number) => void;
  setDemoMode: (isDemoMode: boolean) => void;
  setDemoAddress: (address: string | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOpenBets: (orders: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateOrder: (data: any) => void;
  checkWinEffects: (now: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  selectedMarketId: DEFAULT_MARKET_ID,
  balance: 0,
  serverBalance: 0,
  currentPrice: 0,
  history: [], // Keep track of the line chart
  cells: [],
  basePrice: 0, // Anchor point for the grid
  nextSessionTime: Date.now() + 60000,
  modeIntervalSeconds: 5,
  modePriceStep: getMarketPriceStep(DEFAULT_MARKET_ID),
  bets: {},
  betRates: {},
  pendingBets: {},
  pendingWins: {},
  socket: null,
  wssKey: null,
  betAmount: 0.01,
  isDemoMode: localStorage.getItem("is-demo-mode") === "true",
  demoAddress: localStorage.getItem("demo-wallet-address") || null,
  serverTimeOffset: 0,
  demoWinFeed: null,
  setDemoWinFeed: (v) => set({ demoWinFeed: v }),
  setSelectedMarketId: (marketId) =>
    set(() => ({
      selectedMarketId: marketId,
      modePriceStep: getMarketPriceStep(marketId),
      currentPrice: 0,
      history: [],
      cells: [],
      bets: {},
      betRates: {},
      pendingBets: {},
      pendingWins: {},
    })),

  setConnection: (socket, wssKey) => set({ socket, wssKey }),

  updateBalance: (balance) =>
    set((state) => {
      // balance arrives as micro-USDT from the API; convert to human USDT for display
      const humanBalance = balance / 1_000_000;
      const pendingWinsTotal = Object.values(state.pendingWins).reduce(
        (a, b) => a + b,
        0,
      );
      return {
        serverBalance: humanBalance,
        balance: humanBalance - pendingWinsTotal,
      };
    }),

  syncServerTime: (serverTs) =>
    set(() => ({
      serverTimeOffset: serverTs - Date.now(),
    })),

  setBetAmount: (amount) => set({ betAmount: amount }),

  setDemoMode: (isDemoMode) => {
    localStorage.setItem("is-demo-mode", isDemoMode.toString());
    set({ isDemoMode });
  },

  setDemoAddress: (demoAddress) => {
    if (demoAddress) {
      localStorage.setItem("demo-wallet-address", demoAddress);
    } else {
      localStorage.removeItem("demo-wallet-address");
    }
    set({ demoAddress });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOpenBets: (orders: any[]) =>
    set((state) => {
      const normalizeMarketId = (value: unknown) =>
        String(value ?? "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
      const selectedMarket = normalizeMarketId(state.selectedMarketId);
      const newBets: Record<string, number> = {};
      const newBetRates: Record<string, number> = {};
      for (const order of orders) {
        const orderMarket = normalizeMarketId(order.marketId);
        if (orderMarket && selectedMarket && orderMarket !== selectedMarket) {
          continue;
        }
        if (order.status === "OPEN") {
          const start =
            order.cellTimeStart || order.cell?.startTs || order.startTs;
          const end = order.cellTimeEnd || order.cell?.endTs || order.endTs;
          const lower = order.lowerPrice || order.cell?.lowerPrice;
          const upper = order.upperPrice || order.cell?.upperPrice;
          const cellId = `${start}:${end}:${lower}:${upper}`;
          // order.amount is micro-USDT from server; convert to human USDT
          newBets[cellId] = (Number(order.amount) || 0) / 1_000_000;

          const rate = order.rewardRate || order.cell?.rewardRate;
          if (rate) {
            newBetRates[cellId] = parseFloat(rate);
          }
        }
      }
      return { bets: newBets, betRates: newBetRates };
    }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateOrder: (data: any) =>
    set((state) => {
      const normalizeMarketId = (value: unknown) =>
        String(value ?? "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
      const selectedMarket = normalizeMarketId(state.selectedMarketId);
      const eventMarket = normalizeMarketId(data?.marketId);
      if (eventMarket && selectedMarket && eventMarket !== selectedMarket) {
        return state;
      }

      let newState = { ...state };

      const start = data.cellTimeStart || data.cell?.startTs || data.startTs;
      const end = data.cellTimeEnd || data.cell?.endTs || data.endTs;
      const lower = data.lowerPrice || data.cell?.lowerPrice;
      const upper = data.upperPrice || data.cell?.upperPrice;
      let cellId = `${start}:${end}:${lower}:${upper}`;

      if (data.status === "OPEN") {
        const newPendingBets = { ...newState.pendingBets };
        delete newPendingBets[cellId];

        // data.amount is micro-USDT from server; convert to human USDT
        const confirmedAmount =
          (Number(data.amount) || 0) > 0
            ? Number(data.amount) / 1_000_000
            : newState.pendingBets[cellId] || 0;

        const newBetRates = { ...newState.betRates };
        const rewardRate = data.rewardRate || data.cell?.rewardRate;
        if (rewardRate) {
          newBetRates[cellId] = parseFloat(rewardRate);
        }

        newState = {
          ...newState,
          pendingBets: newPendingBets,
          bets: { ...newState.bets, [cellId]: confirmedAmount },
          betRates: newBetRates,
        };
      }

      const rewardRate = data.rewardRate || data.cell?.rewardRate;
      if (rewardRate) {
        newState = {
          ...newState,
          cells: newState.cells.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  multiplier: parseFloat(rewardRate),
                  original: { ...c.original, rewardRate },
                }
              : c,
          ),
        };
      }

      const isWin =
        data.settledWin === true ||
        String(data.settledWin) === "true" ||
        data.status === "WIN";

      if (isWin) {
        let cell = newState.cells.find((c) => c.id === cellId);
        // Failsafe approximate match in case price float precision caused ID mismatch
        if (!cell && start && end) {
          cell = newState.cells.find(
            (c) =>
              c.timeWindowStart === Number(start) &&
              c.timeWindowEnd === Number(end) &&
              (newState.bets[c.id] || newState.pendingBets[c.id]),
          );
          if (cell) cellId = cell.id;
        }

        if (cell && cell.status !== "hit") {
          const betAmount =
            newState.bets[cellId] ||
            newState.pendingBets[cellId] ||
            Number(data.amount) ||
            10; // Failsafe fallback to persist

          const mult =
            cell.multiplier && !isNaN(cell.multiplier) ? cell.multiplier : 0;
          const win = betAmount * mult;

          const newPendingBets = { ...newState.pendingBets };
          delete newPendingBets[cellId];

          const newPendingWins = { ...newState.pendingWins, [cellId]: win };
          newState = {
            ...newState,
            pendingBets: newPendingBets,
            bets: { ...newState.bets, [cellId]: betAmount }, // Persist the bet so hasAnyBet is true
            pendingWins: newPendingWins,
            balance:
              newState.serverBalance -
              Object.values(newPendingWins).reduce((a, b) => a + b, 0),
          };
        }
      }
      return newState;
    }),

  checkWinEffects: (now: number) =>
    set((state) => {
      if (Object.keys(state.pendingWins).length === 0) {
        return state;
      }

      let changed = false;
      const newState = { ...state };
      const newPendingWins = { ...state.pendingWins };
      const cellById = new Map(
        newState.cells.map((cell) => [cell.id, cell] as const),
      );

      for (const [cellId, winAmount] of Object.entries(state.pendingWins)) {
        const cell = cellById.get(cellId);

        // Cleanup if cell is gone
        if (!cell) {
          delete newPendingWins[cellId];
          changed = true;
          continue;
        }

        // Must have a confirmed bet on this cell
        const hasBet =
          (newState.bets[cellId] ?? 0) > 0 ||
          (newState.pendingBets[cellId] ?? 0) > 0;
        if (!hasBet) {
          // No bet recorded yet — wait (don't remove from pendingWins)
          continue;
        }

        // Calculate physical grid bounds to ensure chart physically touched it
        const lowerPrice =
          cell.original.lowerPrice !== undefined
            ? parseFloat(cell.original.lowerPrice)
            : cell.priceLevel - newState.modePriceStep / 2;
        const upperPrice =
          cell.original.upperPrice !== undefined
            ? parseFloat(cell.original.upperPrice)
            : cell.priceLevel + newState.modePriceStep / 2;

        const isTimeInside =
          now >= cell.timeWindowStart && now <= cell.timeWindowEnd;
        const isTimePassed = now > cell.timeWindowEnd;
        const isPriceInside =
          newState.currentPrice >= lowerPrice &&
          newState.currentPrice <= upperPrice;

        const isTouching = isTimeInside && isPriceInside;

        // Trigger win effect exactly when chart line physically touches the cell, or if the time has passed as fallback
        if (cell.status !== "hit" && (isTouching || isTimePassed)) {
          if (winAmount > 0) {
            toast.success(`You won $${winAmount.toFixed(2)}! 🚀`, {
              style: {
                background: "#252422",
                color: "#2EBD85",
                border: "1px solid rgba(46, 189, 133, 0.5)",
                boxShadow: "0 0 15px rgba(46, 189, 133, 0.3)",
              },
              iconTheme: {
                primary: "#2EBD85",
                secondary: "#252422",
              },
              position: "top-center",
            });
          }

          newState.cells = newState.cells.map((c) =>
            c.id === cellId ? { ...c, status: "hit" as const } : c,
          );

          delete newPendingWins[cellId];
          changed = true;
        }
      }

      if (changed) {
        newState.pendingWins = newPendingWins;
        newState.balance =
          newState.serverBalance -
          Object.values(newPendingWins).reduce((a, b) => a + b, 0);
        return newState;
      }
      return state;
    }),

  updatePrice: (price, serverTs) =>
    set((state) => {
      const now = Date.now();
      let newOffset = state.serverTimeOffset;

      if (serverTs) {
        const rawOffset = serverTs - now;
        if (state.serverTimeOffset === 0) {
          newOffset = rawOffset;
        } else {
          // EMA to smooth out network latency jitter
          newOffset = state.serverTimeOffset * 0.95 + rawOffset * 0.05;
        }
      }
      const syncedNow = now + newOffset;

      // Keep history of last 120 seconds for smooth scrolling
      const newHistory = [...state.history, { time: syncedNow, price }].filter(
        (p) => syncedNow - p.time <= 120000,
      );

      return {
        currentPrice: price,
        history: newHistory,
        serverTimeOffset: newOffset,
      };
    }),

  placeBet: (cellId, amount) =>
    set((state) => {
      if (state.bets[cellId] || state.pendingBets[cellId]) {
        // Already bet on this cell
        return state;
      }
      if (state.balance >= amount) {
        return {
          serverBalance: state.serverBalance - amount,
          balance: state.balance - amount,
          pendingBets: { ...state.pendingBets, [cellId]: amount },
        };
      }

      toast.error("Insufficient balance!", {
        style: {
          background: "#252422",
          color: "#d57455",
          border: "1px solid rgba(213, 116, 85, 0.5)",
        },
      });
      return state;
    }),

  ensureCells: () => {
    // No API for old chart data, wait for socket to populate history
  },

  updateGrid: (newCells) =>
    set((state) => {
      const now = Date.now();

      const remoteIds = new Set<string>();
      const combinedCells = [...state.cells];
      const combinedCellIndex = new Map(
        combinedCells.map((cell, index) => [cell.id, index] as const),
      );

      let serverPriceBand: number | null = null;
      for (const remoteCell of newCells) {
        const id = `${remoteCell.startTs}:${remoteCell.endTs}:${remoteCell.lowerPrice}:${remoteCell.upperPrice}`;
        const timeWindowStart = remoteCell.startTs;
        const timeWindowEnd = remoteCell.endTs;
        const lo = parseFloat(String(remoteCell.lowerPrice));
        const hi = parseFloat(String(remoteCell.upperPrice));
        if (
          serverPriceBand == null &&
          Number.isFinite(lo) &&
          Number.isFinite(hi) &&
          hi > lo
        ) {
          serverPriceBand = hi - lo;
        }
        const priceLevel = (lo + hi) / 2;

        const hasBet =
          (state.bets[id] && state.bets[id] > 0) ||
          (state.pendingBets[id] && state.pendingBets[id] > 0);
        const existingIdx = combinedCellIndex.get(id);

        let finalMultiplier = parseFloat(remoteCell.rewardRate);
        if (hasBet && state.betRates[id] !== undefined) {
          finalMultiplier = state.betRates[id];
        } else if (hasBet && existingIdx !== undefined) {
          finalMultiplier = combinedCells[existingIdx].multiplier;
        }

        remoteIds.add(id);

        if (existingIdx === undefined) {
          combinedCells.push({
            id,
            timeWindowStart,
            timeWindowEnd,
            priceLevel,
            multiplier: finalMultiplier,
            status: timeWindowEnd < now ? "past" : "active",
            original: remoteCell,
          });
          combinedCellIndex.set(id, combinedCells.length - 1);
        } else {
          // Update the multiplier rate since it fluctuates based on bets
          // If the user has bet on this cell, keep the original rate.
          combinedCells[existingIdx] = {
            ...combinedCells[existingIdx],
            multiplier: finalMultiplier,
            priceLevel, // Ensure price bounds sync
            original: remoteCell,
          };
        }
      }

      // Filter out cells that are obsolete (older than 60s)
      // And remove any active future cell that the server no longer broadcasted
      // BUT: never remove cells that have bets (confirmed or pending) — keep them until resolved
      const finalCells = combinedCells.filter((c) => {
        const hasBetOnCell =
          (state.bets[c.id] && state.bets[c.id] > 0) ||
          (state.pendingBets[c.id] && state.pendingBets[c.id] > 0) ||
          state.pendingWins[c.id] !== undefined;
        if (
          c.status === "active" &&
          c.timeWindowStart > now &&
          !remoteIds.has(c.id) &&
          !hasBetOnCell // Don't discard cells the user has bet on
        ) {
          return false; // Safely discard missing future predictions
        }
        return c.timeWindowEnd > now - 60000;
      });

      let modePriceStep = state.modePriceStep;
      if (
        serverPriceBand != null &&
        serverPriceBand > 0 &&
        (modePriceStep <= 0 ||
          Math.abs(modePriceStep - serverPriceBand) / serverPriceBand > 0.02)
      ) {
        modePriceStep = serverPriceBand;
      }

      return modePriceStep === state.modePriceStep
        ? { cells: finalCells }
        : { cells: finalCells, modePriceStep };
    }),

  tickTime: () =>
    set((state) => {
      const now = Date.now();
      const cutoff = now - 60000;

      // Filter out very old cells (older than 60s)
      let cells = state.cells.filter((c) => c.timeWindowEnd > cutoff);

      cells = cells.map((cell) => {
        if (cell.status === "active" && now > cell.timeWindowEnd) {
          return { ...cell, status: "past" as const };
        }
        return cell;
      });

      // Cleanup old bets, pendingBets, and betRates to avoid memory leaks
      const validCellIds = new Set(cells.map((c) => c.id));
      const cleanDict = (dict: Record<string, number>) => {
        let changed = false;
        const result: Record<string, number> = {};
        for (const [key, value] of Object.entries(dict)) {
          if (validCellIds.has(key)) {
            result[key] = value;
          } else {
            changed = true;
          }
        }
        return changed ? result : dict;
      };

      return {
        cells,
        bets: cleanDict(state.bets),
        pendingBets: cleanDict(state.pendingBets),
        betRates: cleanDict(state.betRates),
        pendingWins: cleanDict(state.pendingWins),
      };
    }),
}));
