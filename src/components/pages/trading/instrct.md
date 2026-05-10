## Task
Instead of individual cells that are received by the backend, and then we re-construct cell and place it in the correct position. We implement everything layer by layer.

## Implementation
You must strictly follow the implementation, and after each implementation, you have to stop, and tell me what you have done and confirm before moving to the next step.

## step1
Layer 1 — Background canvas (drawn once)
Grid lines and price labels are completely static between camera moves. Draw them to a canvas and forget about them.
There will be no need to redraw each cell each time, instead whole layer will be rendered once.

Layer 2 — Cells canvas (event-driven, OffscreenCanvas)
Cells only need to redraw when the data changes — not on every frame. Use OffscreenCanvas to pre-render on a background thread, then transferToImageBitmap() to blit it to the visible canvas in microseconds.

Layer 3 — Chart canvas (60fps, hot path)
This is the only layer that runs every single frame. But it only does one thing: clear the previous path and draw the new one. Canvas clearRect + stroke on a path with a few hundred points runs in under 0.5ms per frame on any modern GPU. This is why TradingView can render thousands of candles at 60fps.

Layer 4 — Interaction overlay (click math, no DOM grid)
Instead of 63 <div> elements each listening for clicks, there's one transparent <div> over the whole canvas. Click coordinates are reverse-mapped to cell bounds with pure math.

```ts
function startRenderLoop(renderers: Renderers) {
  let lastCameraPrice = 0;
  let frameId: number;

  const frame = () => {
    const state = useGameStore.getState();
    const n = Date.now();
    const now = n + state.serverTimeOffset;

    // Smooth camera
    lastCameraPrice += (state.currentPrice - lastCameraPrice) * 0.1;

    // Layer 3 — every frame, always
    renderers.chart.draw(state.history, lastCameraPrice, now, dims, ctx);

    // Layer 1 — only when camera drifts
    renderers.background.drawIfNeeded(lastCameraPrice, dims, ctx);

    // Layer 2 — only when data changed (markDirty called on store subscribe)
    renderers.cells.flushIfDirty(state.cells, state.bets, lastCameraPrice, now, ctx);

    // Move the time-line div imperatively
    timeLine.style.transform = `translateX(${getTimeX(now, now, ctx) * dims.width / 100}px)`;

    frameId = requestAnimationFrame(frame);
  };

  // Trigger cell redraw only when store data changes — not on price ticks
  useGameStore.subscribe(
    s => [s.cells, s.bets, s.pendingBets, s.pendingWins],
    () => renderers.cells.markDirty(),
    { equalityFn: shallow }
  );

  frame();
  return () => cancelAnimationFrame(frameId);
}
```

To implement this, create a new file `TradingGridUpdate.tsx` and move the existing `TradingGrid` code there, and then implement the above logic in `TradingView.tsx` to use the new `TradingGridUpdate` component.

Make sure that it dont break other functions like placing bets, and also make sure that the grid is rendered correctly and smoothly.
