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
      const pendingWinIds = Object.keys(state.pendingWins);
      const betIds = Object.keys(state.bets);
      const pendingBetIds = Object.keys(state.pendingBets);

      if (pendingWinIds.length === 0 && betIds.length === 0 && pendingBetIds.length === 0) {
        return state;
      }

      let changed = false;
      const newState = { ...state };
      const newPendingWins = { ...state.pendingWins };
      const cellById = new Map(
        newState.cells.map((cell) => [cell.id, cell] as const),
      );

      // 1. Process pending wins from server
      for (const [cellId, winAmount] of Object.entries(state.pendingWins)) {
        const cell = cellById.get(cellId);
        if (!cell) {
          delete newPendingWins[cellId];
          changed = true;
          continue;
        }

        // If already hit (either locally or previously), just clear from pendingWins and skip toast
        if (cell.status === "hit") {
          delete newPendingWins[cellId];
          changed = true;
          continue;
        }

        const lowerPrice =
          cell.original.lowerPrice !== undefined
            ? parseFloat(cell.original.lowerPrice)
            : cell.priceLevel - newState.modePriceStep / 2;
        const upperPrice =
          cell.original.upperPrice !== undefined
            ? parseFloat(cell.original.upperPrice)
            : cell.priceLevel + newState.modePriceStep / 2;

        const isTouching = (now >= cell.timeWindowStart && now <= cell.timeWindowEnd) && 
                           (newState.currentPrice >= lowerPrice && newState.currentPrice <= upperPrice);
        const isTimePassed = now > cell.timeWindowEnd;

        if (isTimePassed) {
          if (winAmount > 0) {
            toast.success(`You won $${winAmount.toFixed(2)}!`, {
              style: {
                background: "#064d00e9",
                color: "#39ff14",
                border: "2px solid #39ff14",
                boxShadow: "0 0 10px rgba(57, 255, 20, 0.3)",
                fontWeight: "bold",
                fontSize: "12px",
              },
              iconTheme: {
                primary: "#39ff14",
                secondary: "#08090a",
              },
              position: "top-right",
              icon: "🥇",
            });
          }

          newState.cells = newState.cells.map((c) =>
            c.id === cellId ? { ...c, status: "hit" as const } : c,
          );

          delete newPendingWins[cellId];
          changed = true;
        }
      }

      // 2. Process local hits for active bets (not yet in pendingWins)
      const allBets = { ...state.bets, ...state.pendingBets };
      for (const [cellId, betAmount] of Object.entries(allBets)) {
        if (newPendingWins[cellId] !== undefined) continue; // Already handled above

        const cell = cellById.get(cellId);
        if (!cell || cell.status === "hit") continue;

        const lowerPrice =
          cell.original.lowerPrice !== undefined
            ? parseFloat(cell.original.lowerPrice)
            : cell.priceLevel - newState.modePriceStep / 2;
        const upperPrice =
          cell.original.upperPrice !== undefined
            ? parseFloat(cell.original.upperPrice)
            : cell.priceLevel + newState.modePriceStep / 2;

        const isTouching = (now >= cell.timeWindowStart && now <= cell.timeWindowEnd) && 
                           (newState.currentPrice >= lowerPrice && newState.currentPrice <= upperPrice);

        if (isTouching) {
          const mult = cell.multiplier && !isNaN(cell.multiplier) ? cell.multiplier : 0;
          const localWinAmount = betAmount * mult;
          
          newPendingWins[cellId] = localWinAmount;
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

      toast.error("Insufficient balance.", {
        style: {
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
        position: "top-right",
        icon: "💵",
      });
      return state;
    }),

  ensureCells: () => {
    // No API for old chart data, wait for socket to populate history
  },

  updateGrid: (newCells) =>
    set((state) => {
      const now = Date.now();
      const cutoff = now - 60000;
      const {
        cells,
        bets,
        pendingBets,
        betRates,
        pendingWins,
        modePriceStep: currentModePriceStep,
      } = state;

      // Use a fast local map for O(1) index lookups to avoid O(N) reconstruction
      const cellMap = new Map<string, number>();
      for (let i = 0; i < cells.length; i++) {
        cellMap.set(cells[i].id, i);
      }

      const remoteIds = new Set<string>();
      const nextCells = [...cells];
      let changed = false;
      let serverPriceBand: number | null = null;

      // Single pass over new cells
      for (let i = 0; i < newCells.length; i++) {
        const remoteCell = newCells[i];
        const id = `${remoteCell.startTs}:${remoteCell.endTs}:${remoteCell.lowerPrice}:${remoteCell.upperPrice}`;
        remoteIds.add(id);

        const existingIdx = cellMap.get(id);
        const hasBet = (bets[id] ?? 0) > 0 || (pendingBets[id] ?? 0) > 0;

        let finalMultiplier = parseFloat(remoteCell.rewardRate);
        if (hasBet) {
          if (betRates[id] !== undefined) {
            finalMultiplier = betRates[id];
          } else if (existingIdx !== undefined) {
            finalMultiplier = cells[existingIdx].multiplier;
          }
        }

        if (existingIdx === undefined) {
          const lo = parseFloat(remoteCell.lowerPrice);
          const hi = parseFloat(remoteCell.upperPrice);
          if (serverPriceBand === null && hi > lo) {
            serverPriceBand = hi - lo;
          }

          nextCells.push({
            id,
            timeWindowStart: remoteCell.startTs,
            timeWindowEnd: remoteCell.endTs,
            priceLevel: (lo + hi) / 2,
            multiplier: finalMultiplier,
            status: remoteCell.endTs < now ? "past" : "active",
            original: remoteCell,
          });
          changed = true;
        } else {
          const existing = cells[existingIdx];
          // Only update the object if the multiplier or underlying data changed
          if (
            existing.multiplier !== finalMultiplier ||
            existing.original.rewardRate !== remoteCell.rewardRate
          ) {
            nextCells[existingIdx] = {
              ...existing,
              multiplier: finalMultiplier,
              original: remoteCell,
            };
            changed = true;
          }
        }
      }

      // Efficiently filter out obsolete or stale cells in one go
      let finalCells: CellData[] = nextCells;
      const filtered: CellData[] = [];
      let filterNeeded = false;

      for (let i = 0; i < nextCells.length; i++) {
        const c = nextCells[i];

        // 1. Remove very old cells
        if (c.timeWindowEnd <= cutoff) {
          filterNeeded = true;
          continue;
        }

        // 2. Remove inactive future cells no longer being broadcasted (unless there's a bet)
        const hasBetOnCell =
          (bets[c.id] ?? 0) > 0 ||
          (pendingBets[c.id] ?? 0) > 0 ||
          pendingWins[c.id] !== undefined;

        if (
          c.status === "active" &&
          c.timeWindowStart > now &&
          !remoteIds.has(c.id) &&
          !hasBetOnCell
        ) {
          filterNeeded = true;
          continue;
        }

        filtered.push(c);
      }

      if (filterNeeded) {
        finalCells = filtered;
        changed = true;
      }

      // Calculate the most frequent price band from the server for grid snapping
      if (serverPriceBand === null && newCells.length > 0) {
        const lo = parseFloat(newCells[0].lowerPrice);
        const hi = parseFloat(newCells[0].upperPrice);
        if (hi > lo) serverPriceBand = hi - lo;
      }

      let modePriceStep = currentModePriceStep;
      if (serverPriceBand !== null && serverPriceBand > 0) {
        if (
          modePriceStep <= 0 ||
          Math.abs(modePriceStep - serverPriceBand) / serverPriceBand > 0.02
        ) {
          modePriceStep = serverPriceBand;
        }
      }

      // Skip update if no meaningful changes occurred
      if (!changed && modePriceStep === currentModePriceStep) {
        return state;
      }

      return {
        cells: finalCells,
        modePriceStep,
      };
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
