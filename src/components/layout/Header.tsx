import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { 
  ChevronDown,
  Wallet, 
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { useGameStore } from "../../store/store";
import {
  authControllerGetChallenge,
  authControllerLogin,
  authControllerGetWssKey,
  getAccountControllerGetBalanceQueryKey,
  useAccountControllerGetBalance,
} from "../../services/queries";
import { io, Socket } from "socket.io-client";
import CryptoJS from "crypto-js";
import { useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../constant";
import { Link } from "react-router-dom";

const BRAND_ACCENT = "#3ef4ff";

const starAnimationStyle = `
  @keyframes twinkle {
    0%, 100% { opacity: 0.15; }
    25% { opacity: 0.85; }
    50% { opacity: 0.35; }
    75% { opacity: 0.95; }
  }
  @keyframes twinkleSlow {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.7; }
  }
  @keyframes glimmer {
    0%, 100% { opacity: 0.3; filter: brightness(0.8); }
    50% { opacity: 1; filter: brightness(1.2); }
  }
  @keyframes drift {
    0%, 100% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(2px) translateY(-1px); }
    50% { transform: translateX(-1px) translateY(2px); }
    75% { transform: translateX(-2px) translateY(-2px); }
  }
  .starfield-animated {
    animation: twinkle 3.2s ease-in-out infinite, drift 7.5s ease-in-out infinite;
  }
  .starfield-animated-slow {
    animation: twinkleSlow 4.8s ease-in-out infinite, drift 9.2s ease-in-out infinite;
  }
  .starfield-animated-glimmer {
    animation: glimmer 2.4s ease-in-out infinite, drift 8.1s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined') {
  if (!document.getElementById('header-star-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'header-star-animation-styles';
    style.textContent = starAnimationStyle;
    document.head.appendChild(style);
  }
}

export const Header: React.FC<{
  selectedMarketId: string;
  selectedMarketLabel: string;
  markets: { id: string; label: string; icon: React.ReactNode }[];
  setSelectedMarketId: (marketId: string) => void;
}>
= ({ selectedMarketId, selectedMarketLabel, markets, setSelectedMarketId }) => {
  const serverBalance = useGameStore((state) => state.serverBalance);
  const currentPrice = useGameStore((state) => state.currentPrice);
  const betAmount = useGameStore((state) => state.betAmount);
  const setBetAmount = useGameStore((state) => state.setBetAmount);
  const updatePrice = useGameStore((state) => state.updatePrice);
  const updateGrid = useGameStore((state) => state.updateGrid);
  const setConnection = useGameStore((state) => state.setConnection);
  const socketConn = useGameStore((state) => state.socket);
  const updateOrder = useGameStore((state) => state.updateOrder);
  const updateBalance = useGameStore((state) => state.updateBalance);
  const setDemoWinFeed = useGameStore((state) => state.setDemoWinFeed);

  const isDemoMode = useGameStore((state) => state.isDemoMode);
  const demoAddress = useGameStore((state) => state.demoAddress);
  const setDemoMode = useGameStore((state) => state.setDemoMode);
  const setDemoAddress = useGameStore((state) => state.setDemoAddress);

  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();

  const realAddress = publicKey?.toBase58() ?? null;
  const isRealConnected = connected;

  const isConnected = isDemoMode || isRealConnected;
  const address = isDemoMode ? demoAddress : realAddress;

  const isLoggingIn = useRef(false);
  const promptedAddress = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const { data: balanceData, refetch: refetchBalance } =
    useAccountControllerGetBalance({
      query: {
        enabled: !!token,
        retry: false,
      } as any,
    });

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isFunding, setIsFunding] = useState(false);
  const [activeFundingAsset, setActiveFundingAsset] = useState<
    "sol" | "usdt" | "both" | null
  >(null);
  const selectedMarketIdRef = useRef(selectedMarketId);

  useEffect(() => {
    selectedMarketIdRef.current = selectedMarketId;
  }, [selectedMarketId]);

  useEffect(() => {
    if (
      balanceData &&
      typeof (balanceData as unknown as { free?: string }).free !== "undefined"
    ) {
      updateBalance(Number((balanceData as unknown as { free?: string }).free));
    }
  }, [balanceData, updateBalance]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkTime = () => {
      const storedTime = localStorage.getItem("last-fund-time");
      if (storedTime) {
        const lastTime = parseInt(storedTime, 10);
        const targetTime = lastTime + 30 * 60 * 1000;
        const now = Date.now();
        const diff = targetTime - now;
        if (diff > 0) {
          setTimeRemaining(diff);
        } else {
          setTimeRemaining(0);
        }
      } else {
        setTimeRemaining(0);
      }
    };

    if (isFundModalOpen) {
      checkTime();
      interval = setInterval(checkTime, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFundModalOpen]);

  const signChallengeWithSolana = async (_addr: string, challenge: string): Promise<string> => {
    const msgBytes = new TextEncoder().encode(challenge);

    if (isDemoMode) {
      const raw = localStorage.getItem("demo-keypair");
      if (!raw) throw new Error("Demo keypair not found");
      const secretKey = new Uint8Array(JSON.parse(raw));
      const sig = nacl.sign.detached(msgBytes, secretKey);
      return Buffer.from(sig).toString("base64");
    }

    if (!signMessage) throw new Error("Wallet does not support signMessage");
    const sigBytes = await signMessage(msgBytes);
    return Buffer.from(sigBytes).toString("base64");
  };

  const handleLogin = async () => {
    if (!isConnected || !address || isLoggingIn.current) return;

    const storedToken = localStorage.getItem("token");
    const storedAddress = localStorage.getItem("wallet-address");

    if (storedAddress && storedAddress !== address) {
      localStorage.removeItem("token");
      localStorage.removeItem("wallet-address");
      setToken(null);
    }

    if (storedToken && storedAddress === address) {
      // Validate token against the current backend.
      const authCheck = await fetch(`${BACKEND_URL}/api/auth/wss-key`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      if (authCheck.ok) {
        setToken(storedToken);
        return;
      }
      // Token from a previous backend/secret is invalid locally; force fresh login.
      localStorage.removeItem("token");
      localStorage.removeItem("wallet-address");
      setToken(null);
    }
    if (promptedAddress.current === address) return;

    isLoggingIn.current = true;
    promptedAddress.current = address;
    try {
      const challengeRes = await authControllerGetChallenge({ address });
      const challenge = (challengeRes as unknown as { challenge: string }).challenge;

      const signature = await signChallengeWithSolana(address, challenge);

      const loginRes = await authControllerLogin({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });
      const accessToken = (loginRes as unknown as { accessToken: string }).accessToken;

      localStorage.setItem("token", accessToken);
      setToken(accessToken);
      localStorage.setItem("wallet-address", address);
      refetchBalance();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      isLoggingIn.current = false;
    }
  };

  useEffect(() => {
    handleLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isDemoMode]);

  useEffect(() => {
    let socket: Socket | null = null;
    let isActive = true;

    const connectWss = async () => {
      try {
        socket = io(BACKEND_URL);

        socket.on("connect", async () => {
          if (!isActive) return;
          console.log("Header WSS Connected");

          try {
            if (token) {
              const wssKeyRes = await authControllerGetWssKey();
              const wssKey = (wssKeyRes as unknown as { key: string }).key;
              setConnection(socket, wssKey);

              if (address) {
                const challengeRes = await authControllerGetChallenge({
                  address: address as string,
                });
                const wssChallenge = (
                  challengeRes as unknown as { challenge: string }
                ).challenge;

                const hmac = CryptoJS.algo.HMAC.create(
                  CryptoJS.algo.SHA256,
                  CryptoJS.enc.Hex.parse(wssKey),
                );
                hmac.update(address);
                hmac.update(wssChallenge);

                const wssSignature = hmac.finalize().toString(CryptoJS.enc.Hex);

                socket?.emit("subscribe_user", {
                  userId: address,
                  signature: wssSignature,
                });
              }
            }

            const marketId = selectedMarketIdRef.current;
            if (marketId) {
              socket?.emit("subscribe_market", { marketId });
            }
          } catch (e) {
            console.error("WSS Subscription Error:", e);
          }
        });

        const events = [
          "grid_update",
          "balance_update",
          "order_update",
          "price_now",
          "feed_win_demo",
        ];

        events.forEach((evt) => {
          socket?.on(evt, (data) => {
            const normalizeMarketId = (value: unknown) =>
              String(value ?? "")
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
            switch (evt) {
              case "price_now":
                if (
                  data?.price &&
                  normalizeMarketId(data?.marketId) ===
                    normalizeMarketId(selectedMarketIdRef.current)
                ) {
                  updatePrice(data.price, data.ts);
                }
                break;
              case "grid_update":
                if (Array.isArray(data)) {
                  const marketCells = data.filter(
                    (c) =>
                      !c.marketId ||
                      normalizeMarketId(c.marketId) ===
                        normalizeMarketId(selectedMarketIdRef.current),
                  );
                  if (marketCells.length > 0) updateGrid(marketCells);
                }
                break;
              case "balance_update":
                if (data) {
                  queryClient.setQueryData(
                    getAccountControllerGetBalanceQueryKey(),
                    data,
                  );
                }
                break;
              case "order_update":
                if (
                  !data?.marketId ||
                  normalizeMarketId(data.marketId) ===
                    normalizeMarketId(selectedMarketIdRef.current)
                ) {
                  updateOrder(data);
                }
                break;
              case "feed_win_demo":
                if (
                  data &&
                  typeof data.user === "string" &&
                  typeof data.amount === "string"
                ) {
                  setDemoWinFeed({
                    id: typeof data.id === "number" ? data.id : Date.now(),
                    user: data.user,
                    amount: data.amount,
                  });
                }
                break;
            }
          });
        });

        socket.on("disconnect", () => {
          console.log("Header WSS Disconnected");
        });
      } catch (err) {
        console.error("WebSocket setup failed:", err);
      }
    };

    connectWss();

    return () => {
      isActive = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, [
    isConnected,
    address,
    updatePrice,
    updateGrid,
    queryClient,
    setConnection,
    updateOrder,
    setDemoWinFeed,
    token,
  ]);

  useEffect(() => {
    if (!socketConn?.connected) return;
    socketConn.emit("subscribe_market", { marketId: selectedMarketId });
  }, [socketConn, selectedMarketId]);

  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const requestDevnetFaucet = async (
    walletAddress: string,
    accessToken: string | null,
    asset: "sol" | "usdt" | "both" = "both",
  ) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      accept: "*/*",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const requests: Promise<Response>[] = [];
    if (asset === "sol" || asset === "both") {
      requests.push(
        fetch(`${BACKEND_URL}/api/faucet/sol`, {
          method: "POST",
          headers,
          body: JSON.stringify({ walletAddress, amount: "0.5" }),
        }),
      );
    }
    if (asset === "usdt" || asset === "both") {
      requests.push(
        fetch(`${BACKEND_URL}/api/faucet/usdt`, {
          method: "POST",
          headers,
          body: JSON.stringify({ walletAddress, amount: "100" }),
        }),
      );
    }
    const responses = await Promise.all(requests);
    let idx = 0;
    const solRes =
      asset === "sol" || asset === "both" ? responses[idx++] : null;
    const usdtRes =
      asset === "usdt" || asset === "both" ? responses[idx++] : null;

    const parseBody = async (res: Response) => {
      try {
        return await res.json();
      } catch {
        return {};
      }
    };

    const solBody = solRes ? await parseBody(solRes) : null;
    const usdtBody = usdtRes ? await parseBody(usdtRes) : null;

    if (solRes && !solRes.ok) {
      console.warn("SOL faucet failed:", solBody);
      toast.error(solBody?.message ?? "SOL faucet failed");
    }
    if (usdtRes && !usdtRes.ok) {
      console.warn("Token faucet failed:", usdtBody);
      toast.error(usdtBody?.message ?? "Token faucet failed");
    }

    const solOk = !!solRes?.ok;
    const usdtOk = !!usdtRes?.ok;
    if (solOk || usdtOk) {
      if (asset === "both") toast.success("Devnet SOL + USDT faucet processed");
      else if (asset === "sol") toast.success("Devnet SOL faucet processed");
      else toast.success("Devnet USDT faucet processed");
    } else {
      throw new Error("Faucet request failed");
    }

    return { solOk, usdtOk };
  };

  const startDemo = async () => {
    try {
      setIsDemoLoading(true);
      const kp = Keypair.generate();
      localStorage.setItem("demo-keypair", JSON.stringify(Array.from(kp.secretKey)));

      const newAddress = kp.publicKey.toBase58();
      setDemoAddress(newAddress);

      const challengeRes = await authControllerGetChallenge({ address: newAddress });
      const challenge = (challengeRes as unknown as { challenge: string }).challenge;

      const msgBytes = new TextEncoder().encode(challenge);
      const sig = nacl.sign.detached(msgBytes, kp.secretKey);
      const signature = Buffer.from(sig).toString("base64");

      const loginRes = await authControllerLogin({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress, signature }),
      });
      const accessToken = (loginRes as unknown as { accessToken: string }).accessToken;

      localStorage.setItem("token", accessToken);
      setToken(accessToken);
      localStorage.setItem("wallet-address", newAddress);

      await requestDevnetFaucet(newAddress, accessToken);

      // Keep in-app trading balance topped up for quick demo.
      await fetch(`${BACKEND_URL}/api/payment/debug/deposit`, {
        method: "POST",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "100000000",
                          txHash: `devnet_demo_${Date.now()}`,
          logIndex: 2,
        }),
      });

      setDemoMode(true);
      refetchBalance();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (isDemoMode) {
      setDemoMode(false);
      setDemoAddress(null);
      localStorage.removeItem("demo-keypair");
    } else {
      disconnect();
    }
    localStorage.removeItem("token");
    setToken(null);
    localStorage.removeItem("wallet-address");
    promptedAddress.current = null;
    setWalletMenuOpen(false);
  };

  const explorerUrl = address
    ? `https://explorer.solana.com/address/${address}?cluster=devnet`
    : "#";

  return (
    <>
      <header
        className="relative mt-3 xl:mt-4 rounded-2xl border border-white/10 px-3 sm:px-4 xl:px-5 py-3 z-40 overflow-visible"
        style={{
          background: "linear-gradient(145deg, rgba(3, 8, 12, 0.92) 0%, rgba(8, 20, 28, 0.92) 62%, rgba(8, 22, 16, 0.9) 100%)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(62, 244, 255, 0.18)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(62,244,255,0.08), inset 0 -1px 0 rgba(46,189,133,0.08)",
          fontFamily: "'Manrope', sans-serif",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none starfield-animated"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 5% 20%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 12% 35%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 18% 48%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 28% 15%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 35% 42%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 42% 25%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 52% 58%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 62% 20%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 72% 45%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 8% 65%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 25% 75%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 45% 68%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 65% 82%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 78% 72%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 85% 55%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 32% 88%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 58% 92%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 75% 35%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 88% 65%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 15% 12%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 48% 38%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 70% 8%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 92% 42%, rgba(140,252,255,0.92), transparent), radial-gradient(1.1px 1.1px at 38% 58%, rgba(255,255,255,0.83), transparent), radial-gradient(0.9px 0.9px at 18% 82%, rgba(62,244,255,0.88), transparent)",
            opacity: 0.68,
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-1.5 sm:gap-3">
          <div className="relative">
            <Menu as="div">
              <MenuButton className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md border transition-all text-[10px] sm:text-xs font-black tracking-widest uppercase group" style={{ color: BRAND_ACCENT, borderColor: `${BRAND_ACCENT}33`, background: "rgba(255,255,255,0.03)" }}>
                {markets.find(m => m.id === selectedMarketId)?.icon}
                <span className="ml-1 hidden sm:inline"><span style={{"color":"white"}}>{selectedMarketLabel}</span> Market</span>
                <span className="ml-1 sm:hidden text-white">{selectedMarketLabel.split("/")[0]}</span>
                <ChevronDown size={12} className="ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </MenuButton>
              <MenuItems 
                anchor="bottom start" 
                className="mt-2 w-48 origin-top-left rounded-xl border bg-[#040a0e]/98 p-1.5 text-white shadow-2xl backdrop-blur-2xl focus:outline-none z-50 transition duration-150 ease-out data-closed:opacity-0"
                style={{ borderColor: `${BRAND_ACCENT}33` }}
              >
                {markets.map((m) => (
                  <MenuItem key={m.id}>
                    <button 
                      onClick={() => setSelectedMarketId(m.id)}
                      className="group flex w-full items-center gap-3 rounded-lg py-2.5 px-3 transition-all hover:bg-white/5 text-left"
                    >
                      <span className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: BRAND_ACCENT }}>{m.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">{m.label}</span>
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
 
          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end">
            <div
              className="h-10 sm:h-11 px-2 sm:px-4 rounded-md flex items-center gap-1.5 sm:gap-2.5 backdrop-blur-sm transition-all hover:shadow-lg hover:bg-white/10 cursor-pointer"
            >
              <div className="flex flex-row">
                <span className="text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.16em] font-bold text-[#7AA8B5] uppercase">{selectedMarketLabel.split("/")[0] ?? selectedMarketLabel}</span>
                <span className="hidden sm:inline text-[11px] tracking-[0.16em] font-bold text-[#7AA8B5] mx-1">/</span>
                <span className="hidden sm:inline text-[11px] tracking-[0.12em] font-semibold text-[#5F9BA6]">{selectedMarketLabel.split("/")[1] ?? "USDT"}</span>
              </div>
              <div className="h-5 sm:h-6 w-px" style={{ background: "rgba(62, 244, 255, 0.15)" }} />
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xs sm:text-sm font-bold font-mono" style={{ color: "#2EBD85" }}>
                  ${
                    currentPrice >= 1000
                      ? currentPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : currentPrice.toFixed(2)
                  }
                </span>
                <span className="flex h-1 w-1 sm:h-1.5 sm:w-1.5 relative shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "#2EBD85" }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5"
                    style={{ background: "#2EBD85" }}
                  />
                </span>
              </div>
            </div>
            
            <div className="text-[#5F9BA6] opacity-40 mx-0.5 sm:mx-2" style={{ fontSize: "16px" }}>|</div>

            {/* Mobile Hamburger */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <MenuIcon size={24} />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-3">
              {isConnected && (
                <>
                  <div
                    className="hidden lg:flex h-10 px-2.5 items-center gap-1.5 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(7, 18, 24, 0.86) 0%, rgba(8, 20, 18, 0.84) 100%)",
                      border: "1px solid rgba(62, 244, 255, 0.24)",
                    }}
                  >
                    {[1, 2, 5].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBetAmount(preset)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg transition-all"
                        style={{
                          background:
                            betAmount === preset
                              ? "rgba(62, 244, 255, 0.26)"
                              : "rgba(62, 244, 255, 0.08)",
                          color: "#fff",
                          border:
                            betAmount === preset
                              ? "1px solid rgba(62,244,255,0.85)"
                              : "1px solid rgba(62,244,255,0.3)",
                        }}
                      >
                        ${preset}
                      </button>
                    ))}
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{
                        background: "rgba(62,244,255,0.12)",
                        border: "1px solid rgba(62,244,255,0.32)",
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: BRAND_ACCENT }}>$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={betAmount}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v) && v >= 0.01) setBetAmount(v);
                        }}
                        onBlur={()=>{
                          console.log("pending");
                        }}
                        className="bg-transparent font-bold font-mono text-xs outline-none w-14 text-right text-[#CFFFFF]"
                      />
                    </div>
                  </div>

                  <div
                    className="flex h-10 px-3 items-center gap-2 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(7, 18, 24, 0.86) 0%, rgba(8, 20, 18, 0.84) 100%)",
                      border: "1px solid rgba(62, 244, 255, 0.24)",
                    }}
                  >
                    <span className="text-[11px] font-medium text-[#9BB5D8]">BALANCE</span>
                    <span className="font-bold font-mono text-sm text-white">
                      {"$"}
                      {Number(serverBalance).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsFundModalOpen(true)}
                    className="flex h-10 px-4 items-center font-bold rounded-xl text-sm transition-all"
                    style={{
                      background: "rgba(62, 244, 255, 0.22)",
                      border: "1px solid rgba(62, 244, 255, 0.5)",
                      color: "white",
                      boxShadow: "0 0 20px rgba(62, 244, 255, 0.25)",
                    }}
                  >
                    FAUCET
                  </button>
                </>
              )}

              {isConnected ? (
                !token ? (
                  <button
                    onClick={() => {
                      promptedAddress.current = null;
                      handleLogin();
                    }}
                    className="h-10 px-4 font-bold rounded-xl text-sm"
                    style={{
                      background: "rgba(62, 244, 255, 0.22)",
                      border: "1px solid rgba(62, 244, 255, 0.5)",
                      color: "white",
                    }}
                  >
                    LOGIN
                  </button>
                ) : (
                  <div className="relative">
                    {walletMenuOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setWalletMenuOpen(false)}
                      />
                    )}
                    <button
                      onClick={() => setWalletMenuOpen((v) => !v)}
                      className="relative z-50 h-10 font-semibold px-3 sm:px-4 transition-all active:scale-95 flex items-center gap-2 text-xs sm:text-sm rounded-xl"
                      style={{
                        background: "rgba(7, 18, 24, 0.86)",
                        border: "1px solid rgba(62, 244, 255, 0.24)",
                        color: "#ffffff",
                      }}
                    >
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                      {isDemoMode && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{
                            background: "rgba(62,244,255,0.22)",
                            color: BRAND_ACCENT,
                            border: "1px solid rgba(62,244,255,0.35)",
                          }}
                        >
                          DEMO
                        </span>
                      )}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`opacity-70 transition-transform duration-200 ${walletMenuOpen ? "rotate-180" : ""}`}
                        style={{ color: "#9BCDD1" }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {walletMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 w-56 shadow-2xl overflow-hidden z-50 rounded-2xl"
                        style={{
                          background: "rgba(4, 10, 14, 0.98)",
                          border: "1px solid rgba(62, 244, 255, 0.2)",
                        }}
                      >
                        <div
                          className="px-3 pt-3 pb-2"
                          style={{
                            borderBottom: "1px solid rgba(62, 244, 255, 0.2)",
                          }}
                        >
                          <p className="text-[10px] uppercase tracking-wider font-semibold mb-1 text-[#9BB5D8]">
                            {isDemoMode ? "Demo Wallet" : "Connected"}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-xs truncate min-w-0 text-white">
                              {address?.slice(0, 10)}...{address?.slice(-6)}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  if (address) {
                                    navigator.clipboard.writeText(address);
                                    toast.success("Address copied!", {
                                      id: "copy-address-card",
                                      style: {
                                        background: "rgba(10,20,37,0.96)",
                                        color: "#ffffff",
                                        border: "1px solid rgba(62, 244, 255, 0.28)",
                                        fontSize: "12px",
                                      },
                                      iconTheme: {
                                        primary: "#2EBD85",
                                        secondary: "#ffffff",
                                      },
                                    });
                                  }
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Copy Address"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ color: "#A8D4D8" }}
                                >
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              </button>
                              <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="View on Solana Explorer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ color: "#A8D4D8" }}
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleDisconnect}
                          className="w-full text-left px-4 py-3 font-medium transition-colors flex items-center gap-2 text-sm"
                          style={{ color: "#F26880" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(242,104,128,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={startDemo}
                    disabled={isDemoLoading}
                    className="h-10 px-3 sm:px-4 font-bold rounded-xl border transition-all text-xs sm:text-sm disabled:opacity-50"
                    style={{
                      color: BRAND_ACCENT,
                      borderColor: "rgba(62, 244, 255, 0.55)",
                      background: "rgba(7, 18, 24, 0.86)",
                    }}
                  >
                    {isDemoLoading ? "STARTING..." : "DEMO"}
                  </button>
                  <button
                    onClick={() => setWalletModalVisible(true)}
                    className="h-10 px-3 sm:px-4 font-bold rounded-xl text-white transition-all duration-300 text-xs sm:text-sm hover:scale-105 hover:shadow-lg active:scale-95"
                    style={{
                      background: "rgba(62, 244, 255, 0.22)",
                      border: "1px solid rgba(62, 244, 255, 0.5)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(62, 244, 255, 0.32)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(62, 244, 255, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(62, 244, 255, 0.22)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    CONNECT WALLET
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Dialog
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <DialogPanel
            className="w-screen max-w-xs transform transition duration-500 ease-in-out bg-[#040a0e]/98 border-l border-white/10 p-6 flex flex-col gap-8 shadow-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(4, 10, 14, 0.98) 0%, rgba(8, 20, 28, 0.98) 100%)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(62, 244, 255, 0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tighter text-white">MENU</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {isConnected ? (
                <>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9BA6]">Wallet</p>
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{
                        background: "rgba(7, 18, 24, 0.86)",
                        border: "1px solid rgba(62, 244, 255, 0.24)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/90">
                          {address?.slice(0, 8)}...{address?.slice(-8)}
                        </span>
                        {isDemoMode && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            DEMO
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#9BB5D8]">Balance</span>
                          <span className="font-bold text-white font-mono">${Number(serverBalance).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9BA6]">Quick Bet</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 5].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setBetAmount(preset)}
                          className="py-2.5 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: betAmount === preset ? "rgba(62, 244, 255, 0.2)" : "rgba(255,255,255,0.03)",
                            color: betAmount === preset ? BRAND_ACCENT : "white",
                            border: `1px solid ${betAmount === preset ? BRAND_ACCENT : "rgba(255,255,255,0.1)"}`,
                          }}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                      style={{
                        background: "rgba(62,244,255,0.05)",
                        border: "1px solid rgba(62,244,255,0.2)",
                      }}
                    >
                      <span className="text-sm font-bold text-cyan-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={betAmount}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          if (!isNaN(v) && v >= 0.01) setBetAmount(v);
                        }}
                        className="bg-transparent font-bold font-mono text-sm outline-none w-full text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsFundModalOpen(true);
                      }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-cyan-500/20 text-white border border-cyan-500/40 shadow-[0_0_15px_rgba(62,244,255,0.1)]"
                    >
                      FAUCET
                    </button>
                    {!token ? (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          promptedAddress.current = null;
                          handleLogin();
                        }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm bg-cyan-500/20 text-white border border-cyan-500/40"
                      >
                        LOGIN
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleDisconnect();
                        }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        DISCONNECT
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      startDemo();
                    }}
                    disabled={isDemoLoading}
                    className="w-full py-4 rounded-xl font-bold text-sm border border-cyan-500/40 text-cyan-400 bg-cyan-500/5"
                  >
                    {isDemoLoading ? "STARTING..." : "TRY DEMO MODE"}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setWalletModalVisible(true);
                    }}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-cyan-500/20 text-white border border-cyan-500/40 shadow-[0_0_20px_rgba(62,244,255,0.15)]"
                  >
                    CONNECT WALLET
                  </button>
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog
        open={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            className="p-6 max-w-md w-full mx-4 relative"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={() => setIsFundModalOpen(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: "#a0a0a0" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#a0a0a0"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <h2 className="text-lg font-bold mb-1" style={{ color: "#ffffff" }}>
              Faucet Account
            </h2>
            <p className="text-sm mb-6" style={{ color: "#d0d0d0" }}>
              Claim devnet funds for your connected wallet. You can request SOL
              and USDT every 30 minutes.
            </p>

            <div className="flex flex-col items-center gap-4">
              {timeRemaining > 0 ? (
                <div className="w-full flex-1">
                  <div
                    className="px-6 py-3 font-mono text-lg font-bold flex items-center gap-2 w-full justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#ffffff",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "4px",
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d0d0d0" }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Next in {Math.floor(timeRemaining / 1000 / 60)}:{String(Math.floor((timeRemaining / 1000) % 60)).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="h-[1.8px] my-6" style={{background: "rgba(33, 94, 111, 0.51)"}}/>
                    <p className="text-left text-[14px]" style={{color: "rgba(202, 202, 202, 0.94)"}}>
                      Requested credits are successfully added to your walet. You can go ahead and start trading!!
                    </p>
                      <Link
                        onClick={() => setIsFundModalOpen(false)}
                        to="/wallet"
                        >
                        <button
                          className={`w-full flex items-center justify-center gap-1 text-md font-medium mt-4 px-4 py-2 bg-[var(--brand-accent)] rounded-md hover:bg-[var(--brand-accent-hover)] cursor-pointer`}
                        >
                          <Wallet size={18} className="mr-1" />
                          <span className="mb-0.5">
                          Check Wallet
                          </span>
                        </button>
                      </Link>
                  </div>
                </div>
              ) : (
                <>
                  {(
                    [
                      { id: "sol", label: "Get 0.5 SOL" },
                      { id: "usdt", label: "Get 100 USDT" },
                      { id: "both", label: "Get SOL + USDT" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={async () => {
                        const storedToken = localStorage.getItem("token");
                        if (!storedToken) {
                          toast.error("Please login first");
                          return;
                        }
                        const targetAddress =
                          address ?? localStorage.getItem("wallet-address");
                        if (!targetAddress) {
                          toast.error("Connect wallet first");
                          return;
                        }
                        setIsFunding(true);
                        setActiveFundingAsset(item.id);
                        try {
                          const { usdtOk } = await requestDevnetFaucet(
                            targetAddress,
                            storedToken,
                            item.id,
                          );

                          // Keep in-app trading balance aligned when USDT faucet succeeds.
                          if (usdtOk) {
                            await fetch(`${BACKEND_URL}/api/payment/debug/deposit`, {
                              method: "POST",
                              headers: {
                                accept: "*/*",
                                Authorization: `Bearer ${storedToken}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                amount: "100000000",
                                txHash: `devnet_faucet_${item.id}_${Date.now()}`,
                                logIndex: 2,
                              }),
                            });
                            refetchBalance();
                          }

                          localStorage.setItem(
                            "last-fund-time",
                            Date.now().toString(),
                          );
                        } catch (error) {
                          console.error("Faucet failed:", error);
                        } finally {
                          setIsFunding(false);
                          setActiveFundingAsset(null);
                        }
                      }}
                      disabled={isFunding}
                      className="w-full font-semibold px-6 py-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
                      style={{
                        background:
                          item.id === "usdt"
                            ? "rgba(46, 189, 133, 0.22)"
                            : "rgba(62, 244, 255, 0.22)",
                        border:
                          item.id === "usdt"
                            ? "1px solid rgba(46, 189, 133, 0.5)"
                            : "1px solid rgba(62, 244, 255, 0.5)",
                        color: "#ffffff",
                        borderRadius: "4px",
                      }}
                    >
                      {isFunding && activeFundingAsset === item.id ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        item.label
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};
