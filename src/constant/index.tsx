export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ??
  "http://localhost:3001";
export const SOLANA_RPC_URL =
  (import.meta.env.VITE_SOLANA_RPC_URL as string | undefined) ??
  "https://api.devnet.solana.com";
export const CARNOT_PROGRAM_ID =
  (import.meta.env.VITE_CARNOT_PROGRAM_ID as string | undefined) ??
  "carCrmy6qN8tRgvUp9v6JrfUuxroGrKdndUdwMMNumS";
export const USDT_MINT_ADDRESS =
  (import.meta.env.VITE_USDT_MINT_ADDRESS as string | undefined) ??
  "caw3MghdwE1FXAtGF5rhKpqtyML4GAdHxknwNcRatpH";
export const USDT_DECIMALS = 6;
