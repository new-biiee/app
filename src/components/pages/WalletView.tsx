import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Wallet,
  BadgeDollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  CircleDollarSign,
  BanknoteArrowDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  paymentControllerDebugDeposit,
  paymentControllerRequestWithdrawal,
  paymentControllerGetActiveWithdrawalSession,
  paymentControllerDebugFinalizeWithdrawal,
  useAccountControllerGetBalance,
} from "../../services/queries";
import {
  CARNOT_PROGRAM_ID,
  USDT_MINT_ADDRESS,
  USDT_DECIMALS,
} from "../../constant";

// Lazy import IDL to avoid top-level static import issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedIdl: any = null;
async function getIdl() {
  if (!cachedIdl) {
    const mod = await import("@carnot-zk/sdk/idl");
    cachedIdl = mod.carnotIdl;
  }
  return cachedIdl;
}

const PROGRAM_ID = new PublicKey(CARNOT_PROGRAM_ID);
const USDT_MINT = new PublicKey(USDT_MINT_ADDRESS);

export const WalletView: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmountStr, setDepositAmountStr] = useState("");
  const [withdrawAmountStr, setWithdrawAmountStr] = useState("");
  const [showAddress, setShowAddress] = useState(false);

  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const hasAuthToken = !!localStorage.getItem("token");

  const { refetch: refetchOffChainBalance } = useAccountControllerGetBalance({
    query: {
      enabled: hasAuthToken,
      retry: false,
    } as any,
  });

  const [isPending, setIsPending] = useState(false);

  // Wallet from context can change identity every render; keep a ref so getProgram stays stable.
  const walletRef = useRef(wallet);
  walletRef.current = wallet;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getProgram = useCallback(async (): Promise<any> => {
    const idl = await getIdl();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new AnchorProvider(connection, walletRef.current as any, {
      commitment: "confirmed",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Program(idl, provider) as any;
  }, [connection]);

  const fetchUsdtBalance = useCallback(
    async (opts?: { signal?: AbortSignal }) => {
      const signal = opts?.signal;
      if (!publicKey) return;

      const aborted = () => signal?.aborted ?? false;
      if (!aborted()) setIsLoadingBalance(true);
      try {
        try {
          const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
          const bal = await connection.getTokenAccountBalance(userAta);
          if (!aborted()) setUsdtBalance(bal.value.uiAmount ?? 0);
        } catch {
          if (!aborted()) setUsdtBalance(0);
        }

        try {
          const program = await getProgram();
          const [traderAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("trader_account"), publicKey.toBuffer()],
            PROGRAM_ID,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const acct = (await (program.account as any).traderAccount.fetch(
            traderAccountPda,
          )) as Record<string, unknown>;
          const rawBal = acct["balanceUsdt"] ?? acct["balance_usdt"];
          const micro = BN.isBN(rawBal)
            ? (rawBal as BN).toNumber()
            : Number(rawBal ?? 0);
          if (!aborted()) setOnChainBalance(micro / 10 ** USDT_DECIMALS);
        } catch {
          if (!aborted()) setOnChainBalance(null);
        }
      } finally {
        if (!aborted()) setIsLoadingBalance(false);
      }
    },
    [publicKey, connection, getProgram],
  );

  useEffect(() => {
    if (!connected || !publicKey) {
      setUsdtBalance(null);
      setOnChainBalance(null);
      setIsLoadingBalance(false);
      return;
    }

    const ac = new AbortController();
    void fetchUsdtBalance({ signal: ac.signal });
    return () => ac.abort();
  }, [connected, publicKey, fetchUsdtBalance]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmountStr);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (!publicKey || !connected) return toast.error("Wallet not connected");

    setIsPending(true);
    try {
      const program = await getProgram();
      const amountLamports = new BN(Math.floor(amount * 10 ** USDT_DECIMALS));

      const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
      const [globalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        PROGRAM_ID,
      );
      const [vaultState] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID,
      );
      const [traderAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("trader_account"), publicKey.toBuffer()],
        PROGRAM_ID,
      );
      const [traderVaultTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("trader_vault_token")],
        PROGRAM_ID,
      );

      const txSig = await program.methods
        .traderDeposit(amountLamports)
        .accounts({
          trader: publicKey,
          globalState,
          vaultState,
          traderAccount,
          traderTokenAccount: userAta,
          traderVaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as never)
        .rpc();

      // Notify backend — debug endpoint accepts any string as txHash
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first (connect wallet to re-authenticate).");
        return;
      }
      await paymentControllerDebugDeposit(
        {
          amount: amountLamports.toString(),
          txHash: txSig,
          logIndex: 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Deposit successful!");
      setDepositAmountStr("");
      fetchUsdtBalance();
      refetchOffChainBalance();
    } catch (err) {
      console.error(err);
      toast.error("Deposit failed. Check console for details.");
    } finally {
      setIsPending(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmountStr);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > (onChainBalance ?? 0))
      return toast.error("Amount exceeds on-chain balance");
    if (!publicKey || !connected) return toast.error("Wallet not connected");

    setIsPending(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first (connect wallet to re-authenticate).");
        return;
      }
      const authHeader = { Authorization: `Bearer ${token}` };

      // Step 1: request withdrawal session — backend expects micro-USDT integer string
      const withdrawMicro = String(
        Math.round(parseFloat(withdrawAmountStr) * 1_000_000),
      );
      await paymentControllerRequestWithdrawal(
        { amount: withdrawMicro },
        { headers: { ...authHeader, "Content-Type": "application/json" } },
      );

      // Step 2: on-chain withdraw
      const program = await getProgram();
      const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
      const [globalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        PROGRAM_ID,
      );
      const [vaultState] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID,
      );
      const [traderAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("trader_account"), publicKey.toBuffer()],
        PROGRAM_ID,
      );
      const [traderVaultTokenAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("trader_vault_token")],
        PROGRAM_ID,
      );

      // Pass amount in micro-USDT (same as what was sent to the backend session)
      const amountLamports = new BN(Math.round(amount * 10 ** USDT_DECIMALS));
      const txSig = await program.methods
        .traderWithdraw(amountLamports)
        .accounts({
          trader: publicKey,
          globalState,
          vaultState,
          traderAccount,
          traderTokenAccount: userAta,
          traderVaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as never)
        .rpc();

      // Step 3: get session id and finalize
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionData = (await paymentControllerGetActiveWithdrawalSession({
        headers: authHeader,
      })) as any;

      if (!sessionData?.sessionId) {
        toast.error("Could not retrieve withdrawal session.");
        return;
      }

      await paymentControllerDebugFinalizeWithdrawal(
        { sessionId: sessionData.sessionId, txHash: txSig, logIndex: 0 },
        { headers: { ...authHeader, "Content-Type": "application/json" } },
      );

      toast.success("Withdrawal successful!");
      setWithdrawAmountStr("");
      fetchUsdtBalance();
      refetchOffChainBalance();
    } catch (err) {
      console.error(err);
      toast.error("Withdrawal failed. Check console for details.");
    } finally {
      setIsPending(false);
    }
  };

  const isInsufficientDeposit =
    activeTab === "deposit" &&
    usdtBalance !== null &&
    parseFloat(depositAmountStr || "0") > usdtBalance;
  const isInsufficientWithdraw =
    activeTab === "withdraw" &&
    parseFloat(withdrawAmountStr || "0") > (onChainBalance ?? 0);

  const isDisabled =
    !connected ||
    isPending ||
    (activeTab === "deposit"
      ? isInsufficientDeposit || parseFloat(depositAmountStr || "0") <= 0
      : isInsufficientWithdraw || parseFloat(withdrawAmountStr || "0") <= 0);

  const BRAND_ACCENT = "#3ef4ff";

  const CARD_PRIMARY = "rgba(9, 29, 35, 0.34)";

  const formatAddress = (addr: string | null) => {
    if (!addr) return "—";
    return showAddress ? addr : `${addr.slice(0, 4)}....${addr.slice(-4)}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
      {/* Page heading */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b shrink-0 bg-[#030507]/50 backdrop-blur-md z-20" 
          style={{ borderColor: "rgba(62, 244, 255, 0.12)" }}
        >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1
          className="text-lg sm:text-2xl font-extrabold tracking-tight text-white truncate">
            Trade Balance
          </h1>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold uppercase tracking-wider backdrop-blur-md rounded-md shrink-0" 
            style={{ 
              background: "rgba(62, 244, 255, 0.12)", 
              color: BRAND_ACCENT, 
              border: `1px solid ${BRAND_ACCENT}33` 
            }}>
              Devnet
            </span>
        </div>
          <button
            onClick={() => {
              fetchUsdtBalance();
              refetchOffChainBalance();
            }}
          disabled={isLoadingBalance}
          className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-50 shrink-0"
        >
            <RefreshCw
              size={14}
              className={isLoadingBalance ? "animate-spin" : ""}
            />
          <span>
            Refresh
          </span>
          </button>
      </div>

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto pb-10 overflow-x-hidden">
        <div className="p-2 sm:p-4">
          <div className="flex flex-col gap-8">
            {/* Top Row - Balance Cards side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Wallet USDT Card (Credit Card Style) */}
              <div
                className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl relative h-56 sm:h-62 flex flex-col justify-between transition-all group"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_ACCENT}22 0%, rgba(0,0,0,0.4) 100%)`,
                  border: `1px solid ${BRAND_ACCENT}33`,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px ${BRAND_ACCENT}22`,
                  WebkitMask:
                    "radial-gradient(circle at 100% 50%, transparent 25px, black 25px)",
                  mask: "radial-gradient(circle at 100% 50%, transparent 25px, black 25px)",
                }}
              >
                <div
                  className="absolute -right-18 bottom-18 w-full h-2 rounded-full opacity-20 transform rotate-135 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #2df4ffa7 30%, rgba(32, 165, 25, 0.76) 100%)",
                  }}
                />
                <div
                  className="absolute -right-24 bottom-18 w-full h-2 rounded-full opacity-20 transform rotate-135 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, #2df4ffa7 30%, rgba(32, 165, 25, 0.76) 100%)",
                  }}
                />

                {/* Tactile Notch Border */}
                <div
                  className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-20 pointer-events-none"
                  style={{
                    border: `2px solid ${BRAND_ACCENT}88`,
                  }}
                />

                {/* Decorative background elements */}
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <p
                      className="text-sm sm:text-[18px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 opacity-60"
                      style={{ color: BRAND_ACCENT }}
                    >
                      Wallet USDT Balance
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] sm:text-xs font-semibold opacity-80"
                        style={{ color: "#FFFFFF" }}
                      >
                        USDT (Devnet)
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: `${BRAND_ACCENT}22`,
                      border: `1px solid ${BRAND_ACCENT}44`,
                    }}
                  >
                    <CircleDollarSign
                      size={18}
                      style={{ color: BRAND_ACCENT }}
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <p
                    className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
                    style={{ color: "#FFFFFF" }}
                  >
                    {isLoadingBalance
                      ? "..."
                      : usdtBalance !== null
                        ? usdtBalance.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                  </p>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-40"
                      style={{ color: "#FFFFFF" }}
                    >
                      Wallet Address
                    </p>
                    <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                      <p
                        className="text-[10px] sm:text-xs font-mono opacity-80"
                        style={{ color: "#FFFFFF" }}
                      >
                        {formatAddress(publicKey?.toBase58() ?? null)}
                      </p>
                      <button
                        onClick={() => setShowAddress(!showAddress)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        style={{ color: BRAND_ACCENT }}
                      >
                        {showAddress ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-60">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase">
                      Perpetual
                    </span>
                  </div>
                </div>
              </div>

              {/* Protocol USDT Card */}
              <div
                className="p-4 sm:p-6 rounded-3xl backdrop-blur-xl relative h-56 sm:h-62 flex flex-col justify-between transition-all group"
                style={{
                  background: `linear-gradient(135deg, rgba(13, 34, 39, 0.8) 0%, rgba(15, 26, 30, 0.9) 100%)`,
                  border: `1px solid ${BRAND_ACCENT}15`,
                  boxShadow: `0 20px 40px rgba(0,0,0,0.5)`,
                  WebkitMask:
                    "radial-gradient(circle at 100% 50%, transparent 25px, black 25px)",
                  mask: "radial-gradient(circle at 100% 50%, transparent 25px, black 25px)",
                }}
              >
                {/* Tactile Notch Border */}
                <div
                  className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-20 pointer-events-none"
                  style={{
                    border: `2px solid #2EBD85aa`,
                  }}
                />

                {/* Techy background pattern */}
                <div
                  className="absolute inset-0 opacity-14 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(${BRAND_ACCENT} 1.2px, transparent 1.5px)`,
                    backgroundSize: "16px 16px",
                  }}
                />

                <div className="flex justify-between items-start relative z-10">
                  <div className="flex flex-col">
                    <p
                      className="text-sm sm:text-[18px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 opacity-60"
                      style={{ color: BRAND_ACCENT }}
                    >
                      Protocol Balance
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: `rgba(46, 189, 133, 0.1)`,
                          border: `1px solid rgba(46, 189, 133, 0.3)`,
                        }}
                      >
                        <ShieldCheck size={18} style={{ color: "#2EBD85" }} />
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#2EBD85]10 border border-[#2EBD85]30 text-[#2EBD85] uppercase text-[9px] tracking-tighter">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <p
                    className="text-2xl sm:text-3xl font-black font-mono tracking-tight"
                    style={{ color: "#FFFFFF" }}
                  >
                    {isLoadingBalance
                      ? "..."
                      : onChainBalance !== null
                        ? onChainBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold opacity-30 uppercase mt-1">
                    Staked Collateral
                  </p>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase opacity-40">
                        Security
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold">ZK-Settled</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[7px] sm:text-[8px] font-bold uppercase opacity-40">
                        Status
                      </span>
                      <span
                        className="text-[9px] sm:text-[10px] font-bold"
                        style={{ color: "#2EBD85" }}
                      >
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <BadgeDollarSign
                      size={20}
                      className="opacity-80"
                      style={{ color: BRAND_ACCENT }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Illustration and Activity */}
            {/* Tab switcher */}
            <div className="relative flex mt-2 rounded-xl bg-black/40 border border-white/5 w-full max-w-md mx-auto lg:mx-0 shrink-0">
              {(["deposit", "withdraw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setDepositAmountStr("");
                    setWithdrawAmountStr("");
                  }}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-all duration-300 capitalize relative rounded-lg uppercase tracking-widest
                          ${activeTab === tab ? "text-white shadow-lg" : "text-[#7AA8B5] hover:text-[#AACDD4] hover:bg-white/5"}`}
                  style={{
                    background:
                      activeTab === tab ? `${BRAND_ACCENT}33` : "transparent",
                    border:
                      activeTab === tab
                        ? `1px solid ${BRAND_ACCENT}44`
                        : "1px solid transparent",
                  }}
                >
                  <span className="relative z-10">{tab} Activity</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 justify-between">
              <div
                className="overflow-hidden flex flex-col w-full lg:w-[60%]"
                style={{
                  background: CARD_PRIMARY,
                  borderLeft: `3px solid ${BRAND_ACCENT}44`,
                  borderRadius: "16px",
                  padding: "20px sm:24px",
                  marginLeft: "0",
                }}
              >
                {/* Content area */}
                <div className="space-y-4 flex-1 flex flex-col justify-center p-4">
                  {/* Form fields */}
                  {activeTab === "deposit" ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            Deposit Amount
                          </label>
                          <span className="text-[10px] opacity-40">
                            Balance:{" "}
                            <strong className="text-white opacity-100">
                              {usdtBalance?.toFixed(2) ?? "0.00"}
                            </strong>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={depositAmountStr}
                            onChange={(e) =>
                              setDepositAmountStr(e.target.value)
                            }
                            placeholder="0.00"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black font-mono focus:border-[#3ef4ff] outline-none transition-all"
                            style={{ color: "#FFFFFF" }}
                          />
                          <button
                            onClick={() =>
                              usdtBalance !== null &&
                              setDepositAmountStr(usdtBalance.toString())
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#3ef4ff]22 border border-[#3ef4ff]44 text-[#3ef4ff] text-[10px] font-bold uppercase hover:bg-[#3ef4ff]44 transition-all"
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleDeposit}
                        disabled={isDisabled}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all relative overflow-hidden group disabled:opacity-50"
                        style={{
                          background: `linear-gradient(90deg, ${BRAND_ACCENT}22, ${BRAND_ACCENT}44)`,
                          border: `1px solid ${BRAND_ACCENT}55`,
                          color: "#FFFFFF",
                        }}
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {!connected
                            ? "Connect Wallet"
                            : isInsufficientDeposit
                              ? "Low Balance"
                              : isPending
                                ? "Processing..."
                                : "Execute Deposit"}
                          {isPending && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            Withdraw Amount
                          </label>
                          <span className="text-[10px] opacity-40">
                            Available:{" "}
                            <strong className="text-white opacity-100">
                              {onChainBalance?.toFixed(2) ?? "0.00"}
                            </strong>
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={withdrawAmountStr}
                            onChange={(e) =>
                              setWithdrawAmountStr(e.target.value)
                            }
                            placeholder="0.00"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black font-mono focus:border-[#3ef4ff] outline-none transition-all"
                            style={{ color: "#FFFFFF" }}
                          />
                          <button
                            onClick={() =>
                              onChainBalance !== null &&
                              setWithdrawAmountStr(onChainBalance.toString())
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#3ef4ff]22 border border-[#3ef4ff]44 text-[#3ef4ff] text-[10px] font-bold uppercase hover:bg-[#3ef4ff]44 transition-all"
                          >
                            Max
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleWithdraw}
                        disabled={isDisabled}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all relative overflow-hidden group disabled:opacity-50"
                        style={{
                          background: `linear-gradient(90deg, rgba(46, 189, 133, 0.2), rgba(46, 189, 133, 0.4))`,
                          border: `1px solid rgba(46, 189, 133, 0.5)`,
                          color: "#FFFFFF",
                        }}
                      >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {!connected
                            ? "Connect Wallet"
                            : isInsufficientWithdraw
                              ? "Low Balance"
                              : isPending
                                ? "Processing..."
                                : "Execute Withdraw"}
                          {isPending && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          )}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 opacity-30 mt-2">
                    <ShieldCheck size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">
                      End-to-End Encrypted Settlement
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden w-[35%] lg:flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-full max-w-[300px] flex items-center justify-center">
                  <div className="relative z-10 flex flex-col items-center">
                    {activeTab === "deposit" ? (
                      <>
                        <div
                          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
                          style={{ background: `${BRAND_ACCENT}15` }}
                        >
                          <Wallet size={70} style={{ color: BRAND_ACCENT }} />
                        </div>
                        <h3
                          className="text-xl font-black uppercase tracking-widest mb-2"
                          style={{ color: "#FFFFFF" }}
                        >
                          Inbound Flow
                        </h3>
                        <p className="text-center text-sm opacity-50 max-w-[200px]">
                          Securely deposit USDT from your wallet into the Carnot
                          Protocol engine.
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
                          style={{ background: `rgba(46, 189, 133, 0.1)` }}
                        >
                          <BanknoteArrowDown
                            size={70}
                            style={{ color: "#2EBD85" }}
                          />
                        </div>
                        <h3
                          className="text-xl font-black uppercase tracking-widest mb-2"
                          style={{ color: "#FFFFFF" }}
                        >
                          Outbound Flow
                        </h3>
                        <p className="text-center text-sm opacity-50 max-w-[200px]">
                          Withdraw your verified on-chain balance back to your
                          connected wallet.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
