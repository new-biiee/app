import { io } from "socket.io-client";

const SOCKET_URL = "wss://api.carnot.finance";
const MARKET_ID = "solusdt";

// Zero-dependency colors
const blue = (s) => `\x1b[34m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

console.log(`\n${blue("🚀 Starting WebSocket Latency Monitor")}`);
console.log(`${dim(`Connecting to: ${SOCKET_URL}`)}`);
console.log(`${dim(`Target Market: ${MARKET_ID}`)}\n`);

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
});

let lastPriceTime = 0;
let lastGridTime = 0;
let priceCount = 0;
let gridCount = 0;

const stats = {
  priceLatency: [],
  priceIntervals: [],
  gridIntervals: [],
};

socket.on("connect", () => {
  console.log(green("✅ Connected to WebSocket Server"));
  
  // Important: Subscribe to market to receive updates
  console.log(dim(`Emitting subscribe_market for ${MARKET_ID}...`));
  socket.emit("subscribe_market", { marketId: MARKET_ID });

  // Measure Ping
  setInterval(() => {
    const pingStart = Date.now();
    socket.emit("ping", () => {
      const latency = Date.now() - pingStart;
      process.stdout.write(`\r${dim(`Round-trip Ping: ${latency}ms | `)}`);
    });
  }, 2000);
});

socket.on("price_now", (data) => {
  const now = Date.now();
  priceCount++;
  
  if (lastPriceTime > 0) {
    stats.priceIntervals.push(now - lastPriceTime);
  }
  lastPriceTime = now;

  const serverTs = data.ts || data.serverTs;
  let latencyText = "";
  if (serverTs) {
    const latency = now - serverTs;
    stats.priceLatency.push(latency);
    latencyText = ` (Latency: ${latency > 150 ? red(latency + "ms") : green(latency + "ms")})`;
  }

  const avgInterval = stats.priceIntervals.length > 0 
    ? (stats.priceIntervals.reduce((a, b) => a + b, 0) / stats.priceIntervals.length).toFixed(0)
    : "---";

  console.log(
    `${yellow(`[Price] `)}` + 
    `$${data.price.toFixed(4)}` + 
    latencyText +
    ` | Avg Interval: ${avgInterval}ms | Total: ${priceCount}`
  );
});

socket.on("grid_update", (data) => {
  const now = Date.now();
  gridCount++;
  
  if (lastGridTime > 0) {
    stats.gridIntervals.push(now - lastGridTime);
  }
  lastGridTime = now;

  const avgInterval = stats.gridIntervals.length > 0 
    ? (stats.gridIntervals.reduce((a, b) => a + b, 0) / stats.gridIntervals.length).toFixed(0)
    : "---";

  const cellSize = Array.isArray(data) ? data.length : 0;

  console.log(
    `${cyan(`[Grid ] `)}` + 
    `Cells: ${cellSize}` + 
    ` | Avg Interval: ${avgInterval}ms | Total: ${gridCount}`
  );

  if (cellSize === 0) {
    console.log(red(`⚠️ Warning: Received EMPTY grid_update!`));
  }
});

socket.on("connect_error", (err) => {
  console.log(red(`❌ Connection Error: ${err.message}`));
});

socket.on("disconnect", (reason) => {
  console.log(red(`\n🔌 Disconnected: ${reason}`));
});

// Summary report on exit
process.on("SIGINT", () => {
  console.log(`\n\n${blue("📊 Session Summary:")}`);
  
  if (stats.priceLatency.length > 0) {
    const avg = stats.priceLatency.reduce((a, b) => a + b, 0) / stats.priceLatency.length;
    console.log(`Avg Price Latency: ${avg.toFixed(2)}ms`);
  }
  
  if (stats.priceIntervals.length > 0) {
    const avg = stats.priceIntervals.reduce((a, b) => a + b, 0) / stats.priceIntervals.length;
    console.log(`Avg Price Frequency: ${(1000 / avg).toFixed(2)} Hz`);
  }

  if (stats.gridIntervals.length > 0) {
    const avg = stats.gridIntervals.reduce((a, b) => a + b, 0) / stats.gridIntervals.length;
    console.log(`Avg Grid Frequency: ${(1000 / avg).toFixed(2)} Hz`);
  }

  process.exit();
});
