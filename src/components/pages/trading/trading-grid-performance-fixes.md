# TradingGrid Performance Fix Instructions

> These instructions are for an agent to apply in order. Each fix is self-contained.
> Files involved: `TradingGrid.tsx`, `store.tsx`
> Apply fixes in the order listed — earlier fixes unlock later ones.

---

## Fix 1 — Replace `motion.div` with plain `div` on every cell

**File:** `TradingGrid.tsx`
**Why:** Every grid cell is wrapped in Framer Motion's `motion.div`. Framer Motion allocates
animation subscriptions, ResizeObservers, and JS state per element. With 9 rows × multiple
columns, this creates dozens of live Framer Motion instances recalculating on every render.

**Steps:**

1. Remove the `motion` import if it is no longer used anywhere else after this change:
   ```tsx
   // Remove this line if motion is no longer used
   import { motion } from "framer-motion";
   ```

2. Replace `<motion.div` with `<div` and `</motion.div>` with `</div>` on the cell element
   (the one inside `cells.map(...)` starting around line 496).

3. Remove the `whileHover` and `whileTap` props that were on `motion.div`.

4. Add CSS-based hover/tap scaling instead by appending these classes to the cell `className`:
   ```tsx
   canBet && !hasAnyBet && "transition-transform duration-150 hover:scale-95 active:scale-90"
   ```

5. The final cell element opening tag should look like:
   ```tsx
   <div
     key={cell.id}
     className={cn(
       "absolute border-t border-l flex flex-col items-center justify-center text-[10px] transition duration-300",
       canBet && !hasAnyBet && "hover:bg-white/5 cursor-pointer transition-transform duration-150 hover:scale-95 active:scale-90",
       isNext && !hasAnyBet && "opacity-30 cursor-not-allowed animate-pulse",
       !isPast && hasAnyBet && "cursor-pointer z-10",
       !isPast && isPending && "animate-pulse",
       isHit && hasAnyBet && "z-20",
     )}
     style={{ ... }} // keep existing style prop unchanged
     onClick={() => handlePlaceBet(cell, canBet)}
   >
   ```

---

## Fix 2 — Stop calling `setNow` and `setCameraPrice` inside the rAF loop

**File:** `TradingGrid.tsx`
**Why:** The `requestAnimationFrame` loop calls `setNow(serverSyncTime)` and
`setCameraPrice(currentCameraPrice)` every ~15ms. Each call triggers a full React re-render
of `TradingGrid` — including all cells, grid lines, and the SVG path — 60 times per second.
The goal is to drive fast-moving visuals (the time-line div and SVG chart path) imperatively
via DOM refs instead of React state.

**Steps:**

1. Add refs for `now`, `cameraPrice`, the time-line div, and the SVG path element near the
   top of the component (alongside the existing `containerRef`):
   ```tsx
   const nowRef = useRef<number>(Date.now());
   const cameraPriceRef = useRef<number>(currentPrice);
   const timeLineRef = useRef<HTMLDivElement>(null);
   const svgPathRef = useRef<SVGPathElement>(null);
   const svgDotRef = useRef<SVGCircleElement>(null);
   ```

2. Keep the existing `useState` declarations for `now` and `cameraPrice` **only** for the
   initial render and for memoized derived values. Change their update frequency — instead
   of updating every frame, update them at a coarser rate (e.g. every 500ms) so memoized
   geometry (price levels, time labels) stays fresh without 60fps re-renders:
   ```tsx
   const [now, setNow] = useState(() => Date.now());
   const [cameraPrice, setCameraPrice] = useState(currentPrice);
   ```

3. Replace the existing animation `useEffect` (the one with `loop()` and `requestAnimationFrame`)
   with this new version that separates fast imperative DOM updates from slow React state updates:
   ```tsx
   useEffect(() => {
     let frameId: number;
     let lastSlowUpdate = 0;
     let lastWinCheckTime = 0;
     let currentCameraPrice = useGameStore.getState().currentPrice;
     let lastSeenMarketId = useGameStore.getState().selectedMarketId;

     const loop = () => {
       const n = Date.now();
       const state = useGameStore.getState();
       const target = state.currentPrice;
       const currentMarket = state.selectedMarketId;

       // Reset camera on market switch
       if (currentMarket !== lastSeenMarketId) {
         lastSeenMarketId = currentMarket;
         currentCameraPrice = 0;
       }
       if (currentCameraPrice === 0 && target !== 0) {
         currentCameraPrice = target;
       } else {
         currentCameraPrice += (target - currentCameraPrice) * 0.1;
       }

       const serverSyncTime = n + state.serverTimeOffset;

       // --- Fast path: imperative DOM updates (no React re-render) ---
       nowRef.current = serverSyncTime;
       cameraPriceRef.current = currentCameraPrice;

       // Move the vertical time-line div
       if (timeLineRef.current && dimensions.width > 0) {
         const pastSpanMs = isMobile ? 10000 : isSmallScreen ? 15000 : 20000;
         const futureSpanMs = isMobile ? 25000 : 35000;
         const timeSpanMs = pastSpanMs + futureSpanMs;
         const firstTime = serverSyncTime - pastSpanMs;
         const leftPct = ((serverSyncTime - firstTime) / timeSpanMs) * 100;
         timeLineRef.current.style.left = `${leftPct}%`;
       }

       // Update SVG chart path imperatively
       if (svgPathRef.current && dimensions.width > 0 && dimensions.height > 0) {
         const pastSpanMs = isMobile ? 10000 : isSmallScreen ? 15000 : 20000;
         const futureSpanMs = isMobile ? 25000 : 35000;
         const timeSpanMs = pastSpanMs + futureSpanMs;
         const firstTime = serverSyncTime - pastSpanMs;
         const maxPriceLocal = currentCameraPrice + 4.5 * state.modePriceStep;
         const minPriceLocal = currentCameraPrice - 4.5 * state.modePriceStep;
         const totalPriceSpanLocal = maxPriceLocal - minPriceLocal;
         const history = state.history;
         if (history.length > 0) {
           let startIdx = history.findIndex((pt) => pt.time >= firstTime);
           if (startIdx < 0) startIdx = history.length - 1;
           if (startIdx > 0) startIdx -= 1;
           const pts = history.slice(startIdx);
           const d = pts.map((pt, i) => {
             const x = (((pt.time - firstTime) / timeSpanMs) * 100 * dimensions.width) / 100;
             const y = (((maxPriceLocal - pt.price) / totalPriceSpanLocal) * 100 * dimensions.height) / 100;
             return `${i === 0 ? "M" : "L"} ${x} ${y}`;
           }).join(" ");
           svgPathRef.current.setAttribute("d", d);
           // Update the glowing end dot
           if (svgDotRef.current) {
             const last = history[history.length - 1];
             const lx = (((last.time - firstTime) / timeSpanMs) * 100 * dimensions.width) / 100;
             const ly = (((maxPriceLocal - last.price) / totalPriceSpanLocal) * 100 * dimensions.height) / 100;
             svgDotRef.current.setAttribute("cx", String(lx));
             svgDotRef.current.setAttribute("cy", String(ly));
           }
         }
       }

       // --- Slow path: React state update for grid geometry (~2fps) ---
       if (n - lastSlowUpdate > 500) {
         setNow(serverSyncTime);
         setCameraPrice(currentCameraPrice);
         lastSlowUpdate = n;
       }

       // Win check (unchanged)
       if (Object.keys(state.pendingWins).length > 0 && n - lastWinCheckTime > 100) {
         state.checkWinEffects(serverSyncTime);
         lastWinCheckTime = n;
       }

       frameId = requestAnimationFrame(loop);
     };

     loop();
     return () => cancelAnimationFrame(frameId);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dimensions, isMobile, isSmallScreen]);
   ```

4. Attach `timeLineRef` to the current-time indicator div in the JSX:
   ```tsx
   <div
     ref={timeLineRef}
     className="absolute top-0 bottom-0 w-[2px] z-20"
     style={{
       left: `${getTimeX(now)}%`,   // initial position from state; rAF updates it imperatively
       background: "rgba(8, 183, 247, 0.4)",
     }}
   />
   ```

5. Attach `svgPathRef` and `svgDotRef` to the SVG elements inside the `<svg>` block:
   ```tsx
   <path
     ref={svgPathRef}
     d={getSvgPath()}   // initial value; rAF updates imperatively
     fill="none"
     stroke="#8addf9"
     strokeWidth="2"
     strokeLinejoin="round"
     strokeLinecap="round"
   />

   {lPt && (
     <circle
       ref={svgDotRef}
       cx={lPt.x}
       cy={lPt.y}
       r="3.5"
       fill="#08f7b7"
       className="animate-pulse"
     />
   )}
   ```

---

## Fix 3 — Memoize `getSvgPath`, `priceLevels`, `timeLabels`, and `lPt`

**File:** `TradingGrid.tsx`
**Why:** All derived geometry is recalculated on every render. Even after Fix 2 slows React
re-renders to ~2fps, memoising these prevents redundant work when dependencies haven't changed.

**Steps:**

1. Convert `getSvgPath` from an inline function call to a `useMemo`. Place it after the
   `firstTime`/`lastTime`/`maxPrice`/`minPrice` derived constants:
   ```tsx
   const svgPath = useMemo(() => {
     if (history.length === 0 || dimensions.width === 0 || dimensions.height === 0) return "";
     let startIdx = history.findIndex((pt) => pt.time >= firstTime);
     if (startIdx < 0) startIdx = history.length - 1;
     if (startIdx > 0) startIdx -= 1;
     const pts = history.slice(startIdx);
     if (pts.length === 0) return "";
     return pts.map((pt, i) => {
       const x = (getTimeX(pt.time) * dimensions.width) / 100;
       const y = (getPriceY(pt.price) * dimensions.height) / 100;
       return `${i === 0 ? "M" : "L"} ${x} ${y}`;
     }).join(" ");
   }, [history, firstTime, dimensions, cameraPrice]);
   ```

2. Replace the inline `getSvgPath()` call in the JSX with `{svgPath}`:
   ```tsx
   <path
     ref={svgPathRef}
     d={svgPath}
     ...
   />
   ```

3. Memoize `priceLevels`:
   ```tsx
   const priceLevels = useMemo(() => {
     const levels: number[] = [];
     const startLevelIdx = Math.floor((minPrice - basePrice) / modePriceStep) - 1;
     const endLevelIdx = Math.ceil((maxPrice - basePrice) / modePriceStep) + 1;
     for (let i = startLevelIdx; i <= endLevelIdx; i++) {
       levels.push(basePrice + i * modePriceStep);
     }
     return levels;
   }, [basePrice, modePriceStep, cameraPrice]);
   ```

4. Memoize `timeLabels`:
   ```tsx
   const timeLabels = useMemo(() => {
     const labels: number[] = [];
     const interval = 15000;
     let t = Math.floor(firstTime / interval) * interval;
     while (t <= lastTime + interval) {
       if (t >= firstTime && t <= lastTime) labels.push(t);
       t += interval;
     }
     return labels;
   }, [firstTime, lastTime]);
   ```

5. Memoize `lPt`:
   ```tsx
   const lPt = useMemo(() => {
     if (history.length === 0 || dimensions.width === 0) return null;
     const last = history[history.length - 1];
     return {
       x: (getTimeX(last.time) * dimensions.width) / 100,
       y: (getPriceY(last.price) * dimensions.height) / 100,
     };
   }, [history, cameraPrice, dimensions]);
   ```

---

## Fix 4 — Throttle history array trimming in `updatePrice`

**File:** `store.tsx`
**Why:** Every WebSocket price tick does `[...state.history, newPoint].filter(...)`,
spreading the entire history array and producing a new reference. This triggers all
Zustand subscribers watching `history` to re-render unnecessarily.

**Steps:**

1. Locate the `updatePrice` action in `store.tsx` (around line 378).

2. Replace the history construction logic with a version that only trims when the buffer
   exceeds a threshold:
   ```tsx
   updatePrice: (price, serverTs) =>
     set((state) => {
       const now = Date.now();
       let newOffset = state.serverTimeOffset;

       if (serverTs) {
         const rawOffset = serverTs - now;
         if (state.serverTimeOffset === 0) {
           newOffset = rawOffset;
         } else {
           newOffset = state.serverTimeOffset * 0.95 + rawOffset * 0.05;
         }
       }
       const syncedNow = now + newOffset;

       // Append new point
       const newHistory = state.history.concat({ time: syncedNow, price });

       // Only trim when the buffer is large — avoids O(n) filter on every tick
       const trimmed =
         newHistory.length > 1440  // ~120s at ~12 ticks/sec
           ? newHistory.filter((p) => syncedNow - p.time <= 120000)
           : newHistory;

       return {
         currentPrice: price,
         history: trimmed,
         serverTimeOffset: newOffset,
       };
     }),
   ```

---

## Fix 5 — Consolidate Zustand selectors with `shallow`

**File:** `TradingGrid.tsx`
**Why:** The component has 15+ individual `useGameStore` selector calls at the top. Each is
a separate subscriber. When multiple fields change at once (e.g. `updatePrice` changes both
`currentPrice` and `history`), each subscriber fires independently and queues multiple
re-renders.

**Steps:**

1. Add the `shallow` import at the top of the file:
   ```tsx
   import { useGameStore } from "../../../store/store";
   import { shallow } from "zustand/shallow";
   ```

2. Replace all individual `useGameStore` calls for store data with two consolidated selectors
   — one for slow/static config, one for fast-changing trade state:
   ```tsx
   const {
     cells,
     basePrice,
     modePriceStep,
     modeIntervalSeconds,
     bets,
     pendingBets,
     pendingWins,
     betAmount,
     balance,
     selectedMarketId,
   } = useGameStore(
     (s) => ({
       cells: s.cells,
       basePrice: s.basePrice,
       modePriceStep: s.modePriceStep,
       modeIntervalSeconds: s.modeIntervalSeconds,
       bets: s.bets,
       pendingBets: s.pendingBets,
       pendingWins: s.pendingWins,
       betAmount: s.betAmount,
       balance: s.balance,
       selectedMarketId: s.selectedMarketId,
     }),
     shallow,
   );

   // These are only needed for actions/refs — keep as individual selectors
   const placeBet = useGameStore((s) => s.placeBet);
   const socket = useGameStore((s) => s.socket);
   const wssKey = useGameStore((s) => s.wssKey);
   const isDemoMode = useGameStore((s) => s.isDemoMode);
   const demoAddress = useGameStore((s) => s.demoAddress);
   ```

3. Since `history` and `currentPrice` are now read inside the rAF loop via
   `useGameStore.getState()` (from Fix 2), remove their `useGameStore` selector calls
   entirely from the component top. Remove:
   ```tsx
   // DELETE these two lines:
   const history = useGameStore((state) => state.history);
   const currentPrice = useGameStore((state) => state.currentPrice);
   ```

   And keep local `useState` declarations for `now` and `cameraPrice` as the source of
   truth for render-time derived values (set at 2fps in Fix 2).

---

## Fix 6 — Remove `cells.length` from the resize `useEffect` dependency array

**File:** `TradingGrid.tsx`
**Why:** The dimensions `useEffect` re-runs whenever any cell is added or removed. Grid
updates are frequent and container dimensions don't change when cell data arrives.

**Steps:**

1. Locate the dimensions `useEffect` (around line 294). It ends with:
   ```tsx
   }, [cells.length, isMaximized]);
   ```

2. Remove `cells.length` from the dependency array:
   ```tsx
   }, [isMaximized]);
   ```

3. Optionally, strengthen the resize detection by using `ResizeObserver` inside the effect
   instead of the `window.addEventListener("resize", ...)` pattern, so it responds to
   container size changes (e.g. sidebar collapse) rather than only window resize:
   ```tsx
   useEffect(() => {
     if (!containerRef.current) return;
     const el = containerRef.current;
     const update = () => {
       const w = el.clientWidth;
       const h = el.clientHeight;
       if (w > 0 && h > 0) {
         setDimensions((prev) => (prev.width !== w || prev.height !== h ? { width: w, height: h } : prev));
       }
       setIsMobile(window.innerWidth < 640);
       setIsSmallScreen(window.innerWidth < 1280);
     };
     const ro = new ResizeObserver(update);
     ro.observe(el);
     update();
     return () => ro.disconnect();
   }, [isMaximized]);
   ```

---

## Fix 7 — Extract `Cell` into a `React.memo` component

**File:** `TradingGrid.tsx`
**Why:** The entire `cells.map(...)` block re-renders on every state change. Extracting each
cell into a memoised component means React will skip re-rendering cells whose props haven't
changed.

**Steps:**

1. Define a `CellItem` component outside of `TradingGrid` (above the `TradingGrid` function
   definition so it is not re-created on every render):

   ```tsx
   interface CellItemProps {
     cell: CellData;
     now: number;
     left: number;
     top: number;
     colWidth: number;
     rowHeight: number;
     modePriceStep: number;
     betAmount: number;
     hasBet: boolean;
     isPending: boolean;
     displayBetAmount: number;
     isHit: boolean;
     onPlaceBet: (cell: CellData, canBet: boolean) => void;
   }

   const CellItem = React.memo(({ cell, now, left, top, colWidth, rowHeight,
     modePriceStep, betAmount, hasBet, isPending, displayBetAmount, isHit, onPlaceBet,
   }: CellItemProps) => {
     const hasAnyBet = hasBet || isPending;
     const isPast = now >= cell.timeWindowEnd;
     const isFuture = cell.timeWindowStart > now;
     const isNext = isFuture && cell.timeWindowStart - now <= 5000;
     const canBet = isFuture && !isNext && !hasAnyBet;

     return (
       <div
         className={cn(
           "absolute border-t border-l flex flex-col items-center justify-center text-[10px] transition duration-300",
           canBet && !hasAnyBet && "hover:bg-white/5 cursor-pointer transition-transform duration-150 hover:scale-95 active:scale-90",
           isNext && !hasAnyBet && "opacity-30 cursor-not-allowed animate-pulse",
           !isPast && hasAnyBet && "cursor-pointer z-10",
           !isPast && isPending && "animate-pulse",
           isHit && hasAnyBet && "z-20",
         )}
         style={{
           left: `${left}%`,
           top: `${top}%`,
           width: `${colWidth}%`,
           height: `${rowHeight}%`,
           // ... copy existing style logic here
         }}
         onClick={() => onPlaceBet(cell, canBet)}
       >
         {/* ... copy existing cell contents here */}
       </div>
     );
   });
   CellItem.displayName = "CellItem";
   ```

2. In the `cells.map(...)` block inside `TradingGrid`, replace the current inline
   `motion.div` / `div` block with `<CellItem ... />`, passing the required props:
   ```tsx
   {cells.map((cell) => {
     if (cell.timeWindowEnd < firstTime || cell.timeWindowStart > lastTime) return null;

     const betAmountVal = bets[cell.id] || 0;
     const pendingBetAmountVal = pendingBets[cell.id] || 0;
     const hasBet = betAmountVal > 0;
     const isPending = pendingBetAmountVal > 0;
     const hasAnyBet = hasBet || isPending;
     if (now >= cell.timeWindowStart && !hasAnyBet) return null;
     const hasPendingWin = pendingWins[cell.id] !== undefined;
     if (now >= cell.timeWindowEnd && cell.status !== "hit" && !hasPendingWin) return null;

     return (
       <CellItem
         key={cell.id}
         cell={cell}
         now={now}
         left={getTimeX(cell.timeWindowStart)}
         top={getPriceY(cell.priceLevel + modePriceStep / 2)}
         colWidth={colWidth}
         rowHeight={rowHeight}
         modePriceStep={modePriceStep}
         betAmount={betAmount}
         hasBet={hasBet}
         isPending={isPending}
         displayBetAmount={hasBet ? betAmountVal : pendingBetAmountVal}
         isHit={cell.status === "hit"}
         onPlaceBet={handlePlaceBet}
       />
     );
   })}
   ```

---

## Checklist — verify after all fixes are applied

- [ ] No `motion.div` remains inside `cells.map(...)` in `TradingGrid.tsx`
- [ ] `framer-motion` import is removed (or only kept if used elsewhere in the file)
- [ ] `setNow` and `setCameraPrice` are called at most every 500ms, not every rAF frame
- [ ] `timeLineRef` is attached to the time-line indicator `div`
- [ ] `svgPathRef` and `svgDotRef` are attached to the SVG `<path>` and `<circle>` elements
- [ ] `getSvgPath` is replaced by a `useMemo` named `svgPath`
- [ ] `priceLevels`, `timeLabels`, and `lPt` are wrapped in `useMemo`
- [ ] `updatePrice` in `store.tsx` uses `.concat()` and only trims when `length > 1440`
- [ ] `history` and `currentPrice` `useGameStore` selectors are removed from component top
- [ ] Remaining selectors are consolidated using `shallow` from `zustand/shallow`
- [ ] `cells.length` is removed from the resize `useEffect` dependency array
- [ ] `CellItem` is defined as a `React.memo` component outside `TradingGrid`
