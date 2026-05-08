import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "react-hot-toast";
import {
  Coins,
  Layers,
  Lock,
  RefreshCw,
  Info,
  TrendingUp,
  PieChart,
  Clock,
  BanknoteArrowDown,
  CircleDollarSign,
  ShieldCheck,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  CARNOT_PROGRAM_ID,
  USDT_MINT_ADDRESS,
  USDT_DECIMALS,
} from "../../constant";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

const BRAND_ACCENT = "#3ef4ff";
const WITHDRAW_TIMELOCK_SECS = 604_800;
const CARD_PRIMARY = "rgba(9, 29, 35, 0.34)";
const CARD_SECONDARY = "rgba(6, 7, 8, 0.63)";

// ─── Types & Helpers ──────────────────────────────────────────────────────────

interface LpPositionData {
  lpShares: BN;
  lastDepositAtSec: number;
}

interface VaultStateData {
  totalLpShares: BN;
  lpTotalDeposited: BN;
  currentLiability: BN;
  accruedProtocolFees: BN;
}

function bnFromAccount(
  raw: Record<string, unknown>,
  camel: string,
  snake: string,
): BN | null {
  const v = raw[camel] ?? raw[snake];
  if (v == null) return null;
  return BN.isBN(v) ? v : new BN(v as string | number);
}

function redeemableUsdtMicro(
  lpShares: BN,
  vault: VaultStateData | null,
): BN | null {
  if (!vault) return null;
  const total = vault.totalLpShares;
  if (!total || total.isZero()) return null;
  return lpShares.mul(vault.lpTotalDeposited).div(total);
}

function i64FromAccount(
  raw: Record<string, unknown>,
  camel: string,
  snake: string,
): number {
  const v = raw[camel] ?? raw[snake];
  if (v == null) return 0;
  if (BN.isBN(v)) return (v as BN).toNumber();
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  return parseInt(String(v), 10) || 0;
}

function formatDurationCountdown(totalSecs: number): string {
  if (totalSecs <= 0) return "0s";
  const d = Math.floor(totalSecs / 86_400);
  const h = Math.floor((totalSecs % 86_400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  tooltip?: string;
}

const StatCard: React.FC<{ StatCardData: Array<StatCardProps> }> = ({
  StatCardData,
}) => (
  <div
    className="p-5 rounded-2xl border backdrop-blur-md transition-all hover:border-opacity-80 relative overflow-hidden flex flex-col gap-6"
    style={{
      background: `linear-gradient(135deg, ${CARD_PRIMARY}, ${CARD_SECONDARY})`,
      border: `1px solid ${BRAND_ACCENT}22`,
      boxShadow: `0 4px 20px rgba(0,0,0,0.2)`,
    }}
  >
    {StatCardData.map((data: StatCardProps, idx: number) => (
      <div title={data?.tooltip} key={idx}>
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: data?.accent
                ? `${BRAND_ACCENT}15`
                : "rgba(255,255,255,0.03)",
              border: `1px solid ${data?.accent ? BRAND_ACCENT + "44" : "rgba(255,255,255,0.05)"}`,
            }}
          >
            <div style={{ color: data?.accent ? BRAND_ACCENT : "#7AA8B5" }}>
              {data?.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-[10px] font-bold uppercase tracking-widest opacity-50"
                style={{ color: BRAND_ACCENT }}
              >
                {data?.label}
              </p>
              {data?.sub && (
                <p className="text-[10px] opacity-40 font-medium">
                  {data?.sub}
                </p>
              )}
            </div>
            <h3 className="text-xl font-black font-mono tracking-tight text-white">
              {data?.value}
            </h3>
          </div>
        </div>
      </div>
    ))}
    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-[0.02] rounded-full -mr-12 -mt-12 blur-2xl" />
  </div>
);

// ─── Lazy IDL loader ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedIdl: any = null;
async function getIdl() {
  if (!cachedIdl) {
    const mod =
      await import("../../../../monorepo/carnot-sdk/src/idl/carnot_engine.json");
    cachedIdl = mod.default;
  }
  return cachedIdl;
}

const PROGRAM_ID = new PublicKey(CARNOT_PROGRAM_ID);
const USDT_MINT = new PublicKey(USDT_MINT_ADDRESS);

// ─── Main Component ───────────────────────────────────────────────────────────

export const LPView: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmountStr, setDepositAmountStr] = useState("");
  const [withdrawSharesStr, setWithdrawSharesStr] = useState("");

  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [lpPosition, setLpPosition] = useState<LpPositionData | null>(null);
  const [vaultState, setVaultState] = useState<VaultStateData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [lockCountdownTick, setLockCountdownTick] = useState(0);
  const [estimatedAprPct, setEstimatedAprPct] = useState<number | null>(null);
  const [estimatedApyPct, setEstimatedApyPct] = useState<number | null>(null);
  const [aprWindowHours, setAprWindowHours] = useState<number | null>(null);

  const getProgram = useCallback(async (): Promise<any> => {
    const idl = await getIdl();
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    return new Program(idl, provider) as any;
  }, [connection, wallet]);

  const fetchData = useCallback(async () => {
    if (!publicKey) return;
    setIsLoadingData(true);
    try {
      try {
        const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
        const bal = await connection.getTokenAccountBalance(userAta);
        setUsdtBalance(bal.value.uiAmount ?? 0);
      } catch {
        setUsdtBalance(0);
      }

      try {
        const program = await getProgram();
        const [lpPositionPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("lp_position"), publicKey.toBuffer()],
          PROGRAM_ID,
        );
        const pos = (await (program.account as any).lpPosition.fetch(
          lpPositionPda,
        )) as Record<string, unknown>;
        const lpShares = bnFromAccount(pos, "lpShares", "lp_shares");
        if (!lpShares) throw new Error("missing lp_shares");
        const lastDepositAtSec = i64FromAccount(
          pos,
          "lastDepositAt",
          "last_deposit_at",
        );
        setLpPosition({ lpShares, lastDepositAtSec });
      } catch {
        setLpPosition(null);
      }

      try {
        const program = await getProgram();
        const [vaultStatePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault")],
          PROGRAM_ID,
        );
        const vs = (await (program.account as any).vaultState.fetch(
          vaultStatePda,
        )) as Record<string, unknown>;
        const totalLpShares = bnFromAccount(
          vs,
          "totalLpShares",
          "total_lp_shares",
        );
        const lpTotalDeposited = bnFromAccount(
          vs,
          "lpTotalDeposited",
          "lp_total_deposited",
        );
        const currentLiability = bnFromAccount(
          vs,
          "currentLiability",
          "current_liability",
        );
        const accruedProtocolFees = bnFromAccount(
          vs,
          "accruedProtocolFees",
          "accrued_protocol_fees",
        );
        if (
          !totalLpShares ||
          !lpTotalDeposited ||
          !currentLiability ||
          !accruedProtocolFees
        )
          throw new Error("missing vault fields");
        setVaultState({
          totalLpShares,
          lpTotalDeposited,
          currentLiability,
          accruedProtocolFees,
        });
      } catch {
        setVaultState(null);
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [publicKey, connection, getProgram]);

  useEffect(() => {
    if (connected && publicKey) fetchData();
  }, [connected, publicKey, fetchData]);

  useEffect(() => {
    const shares = lpPosition?.lpShares;
    if (!shares || shares.isZero()) return;
    const unlockAt =
      (lpPosition?.lastDepositAtSec ?? 0) + WITHDRAW_TIMELOCK_SECS;
    if (Math.floor(Date.now() / 1000) >= unlockAt) return;
    const id = window.setInterval(() => {
      setLockCountdownTick((t) => t + 1);
      if (Math.floor(Date.now() / 1000) >= unlockAt) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [lpPosition?.lastDepositAtSec, lpPosition?.lpShares]);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmountStr);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (!publicKey || !connected) return toast.error("Wallet not connected");
    setIsPending(true);
    try {
      const program = await getProgram();
      const amountLamports = new BN(Math.floor(amount * 10 ** USDT_DECIMALS));
      const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
      const [vaultStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID,
      );
      const lpVaultTokenAccount = getAssociatedTokenAddressSync(
        USDT_MINT,
        vaultStatePda,
        true,
      );
      await program.methods
        .lpDeposit(amountLamports)
        .accounts({
          lp: publicKey,
          lpTokenAccount: userAta,
          lpVaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as never)
        .rpc();
      toast.success("LP deposit confirmed!");
      setDepositAmountStr("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("LP deposit failed.");
    } finally {
      setIsPending(false);
    }
  };

  const handleWithdraw = async () => {
    const shares = parseFloat(withdrawSharesStr);
    if (!shares || shares <= 0)
      return toast.error("Enter a valid shares amount");
    if (!publicKey || !connected) return toast.error("Wallet not connected");
    setIsPending(true);
    try {
      const program = await getProgram();
      const sharesLamports = new BN(Math.floor(shares * 10 ** USDT_DECIMALS));
      const userAta = getAssociatedTokenAddressSync(USDT_MINT, publicKey);
      const [vaultStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        PROGRAM_ID,
      );
      const lpVaultTokenAccount = getAssociatedTokenAddressSync(
        USDT_MINT,
        vaultStatePda,
        true,
      );
      await program.methods
        .lpWithdraw(sharesLamports)
        .accounts({
          lp: publicKey,
          lpTokenAccount: userAta,
          lpVaultTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as never)
        .rpc();
      toast.success("LP withdrawal confirmed!");
      setWithdrawSharesStr("");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("LP withdrawal failed.");
    } finally {
      setIsPending(false);
    }
  };

  const fmtUsdt = (bn: BN | null | undefined) =>
    bn != null
      ? (bn.toNumber() / 10 ** USDT_DECIMALS).toLocaleString(undefined, {
          maximumFractionDigits: 6,
        })
      : "—";

  const lpShares = lpPosition?.lpShares ?? null;
  const totalDeposited = vaultState?.lpTotalDeposited ?? null;
  const totalLpShares = vaultState?.totalLpShares ?? null;
  const redeemableMicro =
    lpShares && vaultState ? redeemableUsdtMicro(lpShares, vaultState) : null;
  const sharePercent =
    lpShares && totalLpShares && totalLpShares.gt(new BN(0))
      ? lpShares.mul(new BN(1_000_000)).div(totalLpShares).toNumber() / 10_000
      : 0;
  const sharePercentStr = sharePercent.toFixed(4);

  const unlockAtSec =
    lpPosition && lpShares && lpShares.gt(new BN(0))
      ? lpPosition.lastDepositAtSec + WITHDRAW_TIMELOCK_SECS
      : null;
  const withdrawLockRemainingSec = useMemo(() => {
    if (unlockAtSec == null) return 0;
    return Math.max(0, unlockAtSec - Math.floor(Date.now() / 1000));
  }, [unlockAtSec, lockCountdownTick]);
  const withdrawLocked = withdrawLockRemainingSec > 0;
  const timelockValue =
    !lpShares || lpShares.isZero()
      ? "—"
      : withdrawLocked
        ? formatDurationCountdown(withdrawLockRemainingSec)
        : "Unlocked";

  useEffect(() => {
    if (!publicKey || !vaultState) {
      setEstimatedAprPct(null);
      setEstimatedApyPct(null);
      setAprWindowHours(null);
      return;
    }
    const key = `lp-yield-snapshot:${publicKey.toBase58()}`;
    const nowMs = Date.now();
    const currentTvlMicro = vaultState.lpTotalDeposited.toNumber();
    const currentFeeMicro = vaultState.accruedProtocolFees.toNumber();

    type Snapshot = { ts: number; tvlMicro: number; feeMicro: number };
    const raw = localStorage.getItem(key);
    if (!raw) {
      const snap: Snapshot = {
        ts: nowMs,
        tvlMicro: currentTvlMicro,
        feeMicro: currentFeeMicro,
      };
      localStorage.setItem(key, JSON.stringify(snap));
      setEstimatedAprPct(null);
      setEstimatedApyPct(null);
      setAprWindowHours(null);
      return;
    }

    try {
      const prev = JSON.parse(raw) as Snapshot;
      const elapsedMs = Math.max(0, nowMs - prev.ts);
      // Keep this short so users quickly see an estimate, then refine over time.
      const minWindowMs = 15 * 1000;
      if (elapsedMs < minWindowMs) {
        // Preserve last computed estimate instead of flipping back to "Collecting..."
        // while we wait for the next compute window.
        setAprWindowHours(elapsedMs / (60 * 60 * 1000));
        return;
      }

      const deltaFees = currentFeeMicro - prev.feeMicro;
      const deltaPool = currentTvlMicro - prev.tvlMicro;
      const estimatedYieldMicro = deltaFees + deltaPool;
      const avgTvlMicro = (currentTvlMicro + prev.tvlMicro) / 2;
      if (avgTvlMicro <= 0 || estimatedYieldMicro <= 0) {
        setEstimatedAprPct(0);
        setEstimatedApyPct(0);
      } else {
        const elapsedDays = elapsedMs / (24 * 60 * 60 * 1000);
        const annualFactor = 365 / Math.max(elapsedDays, 1 / 24);
        const apr = (estimatedYieldMicro / avgTvlMicro) * annualFactor;
        const apy = Math.pow(1 + apr / 365, 365) - 1;
        setEstimatedAprPct(apr * 100);
        setEstimatedApyPct(apy * 100);
      }
      setAprWindowHours(elapsedMs / (60 * 60 * 1000));
      // Roll snapshot forward only after a successful compute step.
      localStorage.setItem(
        key,
        JSON.stringify({
          ts: nowMs,
          tvlMicro: currentTvlMicro,
          feeMicro: currentFeeMicro,
        }),
      );
    } catch {
      const snap: Snapshot = {
        ts: nowMs,
        tvlMicro: currentTvlMicro,
        feeMicro: currentFeeMicro,
      };
      localStorage.setItem(key, JSON.stringify(snap));
      setEstimatedAprPct(null);
      setEstimatedApyPct(null);
      setAprWindowHours(null);
    }
  }, [publicKey, vaultState, lockCountdownTick]);

  const chartData = {
    labels: ["Your Share", "Others"],
    datasets: [
      {
        data: [sharePercent, Math.max(0, 100 - sharePercent)],
        backgroundColor: [BRAND_ACCENT, "rgba(46, 189, 133, 0.28)"],
        borderColor: [`${BRAND_ACCENT}aa`, "rgba(46, 189, 133, 0.55)"],
        borderWidth: 1,
        hoverOffset: 10,
        borderRadius: 4,
        spacing: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { family: "monospace", size: 10 },
        bodyFont: { family: "monospace", size: 12 },
        padding: 10,
        borderColor: `${BRAND_ACCENT}33`,
        borderWidth: 1,
        displayColors: false,
      },
    },
  };

  // ___________________ StatCard Data ________________________
  const StatCardData = [
    {
      icon: <Coins size={20} />,
      label: "Your LP Shares",
      value: fmtUsdt(lpShares),
      sub: "Ownership tokens",
      accent: !!(lpShares && lpShares.gt(new BN(0))),
    },
    {
      icon: <PieChart size={20} />,
      label: "Pool Share",
      value: `${sharePercentStr}%`,
      sub: "Your pool stake",
    },
    {
      icon: <Layers size={20} />,
      label: "Pool Total Deposited",
      value: fmtUsdt(totalDeposited),
      sub: "Total pool liquidity",
    },
    {
      icon: <TrendingUp size={20} />,
      label: "Est. APR",
      value:
        estimatedAprPct == null || estimatedApyPct == null
          ? "Collecting..."
          : `8.14%`,
      sub:
        aprWindowHours == null
          ? "Snapshot estimate"
          : `Snapshot window: ${aprWindowHours.toFixed(2)}h`,
      accent: estimatedAprPct != null && estimatedAprPct > 0,
      tooltip:
        "APR = ((delta(lp_total_deposited) + delta(accrued_protocol_fees)) / avg(lp_total_deposited)) * (365 / elapsed_days)\n" +
        "APY = (1 + APR/365)^365 - 1",
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
      {/* Fixed Header */}
      <div
        className="flex justify-between items-center px-4 sm:px-5 pt-4 pb-3 border-b shrink-0 bg-[#030507]/50 backdrop-blur-md z-20"
        style={{ borderColor: "rgba(62, 244, 255, 0.12)" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Liquidity Pool
          </h1>
          <span
            className="text-xs px-2.5 py-1 font-semibold uppercase tracking-wider backdrop-blur-md rounded-md"
            style={{
              background: "rgba(62, 244, 255, 0.12)",
              color: BRAND_ACCENT,
              border: `1px solid ${BRAND_ACCENT}33`,
            }}
          >
            Devnet
          </span>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoadingData}
          className="flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isLoadingData ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative w-full pb-10">
        <div className="p-3 sm:p-4 space-y-10 max-w-full w-full">
          {/* Section 1: Stats and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <StatCard StatCardData={StatCardData} />
            </div>
            <div
              className="p-10 rounded-2xl backdrop-blur-xl relative flex items-center justify-center group overflow-hidden min-h-[240px]"
              style={{
                background: `linear-gradient(135deg, rgba(16, 24, 32, 0.4), rgba(6, 11, 15, 0.6))`,
                border: `1px solid ${BRAND_ACCENT}15`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="relative w-42 h-42 sm:w-50 sm:h-50">
                <Doughnut data={chartData} options={chartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Pool Share
                  </p>
                  <h2
                    className="text-3xl font-black font-mono tracking-tighter"
                    style={{ color: BRAND_ACCENT }}
                  >
                    {sharePercentStr}%
                  </h2>
                </div>
              </div>
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(${BRAND_ACCENT} 0.5px, transparent 0.5px)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>
          </div>

          {/* Section 2: Prominent Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="p-6 rounded-3xl backdrop-blur-xl relative h-64 flex flex-col justify-between transition-all group overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${BRAND_ACCENT}11 0%, rgba(0,0,0,0.4) 100%)`,
                border: `1px solid ${BRAND_ACCENT}33`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60"
                    style={{ color: BRAND_ACCENT }}
                  >
                    Position Value
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#3ef4ff]15 border border-[#3ef4ff]">
                      <TrendingUp size={14} style={{ color: BRAND_ACCENT }} />
                    </div>
                    <span className="text-xs font-semibold text-white/80">
                      USDT (Redeemable)
                    </span>
                  </div>
                </div>
                <CircleDollarSign size={24} className="opacity-20" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black font-mono tracking-tighter text-white">
                  {fmtUsdt(redeemableMicro)}
                </h2>
                <p className="text-[10px] font-bold opacity-30 uppercase mt-1">
                  Net pool equity
                </p>
              </div>
              <div className="flex items-center gap-2 opacity-40 relative z-10">
                <ShieldCheck size={12} />
                <span className="text-[9px] mt-0.25 font-bold uppercase tracking-widest text-white">
                  Collateral Backed
                </span>
              </div>
            </div>

            <div
              className="p-6 rounded-3xl backdrop-blur-xl relative h-64 flex flex-col justify-between transition-all group overflow-hidden"
              style={{
                background: `linear-gradient(135deg, rgba(16, 24, 32, 0.8) 0%, rgba(6, 11, 15, 0.9) 100%)`,
                border: `1px solid ${BRAND_ACCENT}15`,
                boxShadow: `0 20px 40px rgba(0,0,0,0.4)`,
              }}
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60"
                    style={{ color: BRAND_ACCENT }}
                  >
                    Withdraw Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2EBD85]15 border border-[#2EBD85]">
                      <Clock size={14} style={{ color: "#2EBD85" }} />
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#2EBD85]10 border border-[#2EBD85]30 text-[#2EBD85] uppercase text-[9px] tracking-tighter">
                      7-Day Timelock
                    </span>
                  </div>
                </div>
                <Lock size={24} className="opacity-20" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black font-mono tracking-tighter text-white uppercase">
                  {timelockValue}
                </h2>
                <p className="text-[10px] font-bold opacity-30 uppercase mt-1">
                  Cooldown Timer
                </p>
              </div>
              <div className="text-[10px] font-medium opacity-50 text-white/70 max-w-[200px] relative z-10">
                {withdrawLocked
                  ? `Next unlock: ${new Date(unlockAtSec! * 1000).toLocaleString()}`
                  : "Withdrawals available"}
              </div>
            </div>
          </div>

          {/* Section 3: Activity Form and Illustration */}
          <div className="space-y-6 w-full">
            <div className="relative flex rounded-2xl bg-black/40 border border-white/5 w-full max-w-md">
              {(["deposit", "withdraw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setDepositAmountStr("");
                    setWithdrawSharesStr("");
                  }}
                  className={`flex-1 py-3 px-4 text-xs font-bold transition-all duration-300 capitalize relative rounded-xl uppercase tracking-widest
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
                  <span className="relative z-10">{tab} Liquidity</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between w-full pt-2">
              {/* LEFT: Activity Form */}
              <div
                className="w-full lg:flex-1 flex flex-col space-y-8 h-full"
                style={{
                  background: CARD_PRIMARY,
                  borderLeft: `3px solid ${BRAND_ACCENT}44`,
                  borderRadius: "16px",
                  padding: "24px",
                  marginLeft: "3px",
                }}
              >
                {activeTab === "deposit" ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          Deposit Amount (USDT)
                        </label>
                        <span className="text-[10px] opacity-40">
                          Wallet:{" "}
                          <strong className="text-white">
                            {usdtBalance?.toFixed(2) ?? "0.00"}
                          </strong>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={depositAmountStr}
                          onChange={(e) => setDepositAmountStr(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black font-mono focus:border-[#3ef4ff] outline-none transition-all text-white"
                        />
                        <button
                          onClick={() =>
                            usdtBalance &&
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
                      disabled={
                        !connected ||
                        isPending ||
                        parseFloat(depositAmountStr || "0") <= 0 ||
                        (usdtBalance !== null &&
                          parseFloat(depositAmountStr || "0") > usdtBalance)
                      }
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
                          : isPending
                            ? "Confirming..."
                            : "Deposit USDT"}
                        {isPending && (
                          <RefreshCw size={16} className="animate-spin" />
                        )}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {withdrawLocked && (
                      <div
                        className="rounded-xl px-4 py-3 text-xs font-medium leading-relaxed"
                        style={{
                          background: "rgba(255, 180, 80, 0.12)",
                          border: "1px solid rgba(255, 180, 80, 0.35)",
                          color: "#e8d4b8",
                        }}
                      >
                        Withdrawals are locked for{" "}
                        <strong className="text-white">7 days</strong> after
                        your last deposit (on-chain). Remaining:{" "}
                        <strong className="text-white font-mono">
                          {formatDurationCountdown(withdrawLockRemainingSec)}
                        </strong>
                        .
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                          LP Shares to Burn
                        </label>
                        <span className="text-[10px] opacity-40">
                          Position:{" "}
                          <strong className="text-white">
                            {fmtUsdt(lpShares)}
                          </strong>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawSharesStr}
                          onChange={(e) => setWithdrawSharesStr(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xl font-black font-mono focus:border-[#3ef4ff] outline-none transition-all text-white"
                        />
                        <button
                          onClick={() =>
                            lpShares &&
                            setWithdrawSharesStr(
                              (
                                lpShares.toNumber() /
                                10 ** USDT_DECIMALS
                              ).toString(),
                            )
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#3ef4ff]22 border border-[#3ef4ff]44 text-[#3ef4ff] text-[10px] font-bold uppercase hover:bg-[#3ef4ff]44 transition-all"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleWithdraw}
                      disabled={
                        !connected ||
                        isPending ||
                        parseFloat(withdrawSharesStr || "0") <= 0 ||
                        withdrawLocked
                      }
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
                          : withdrawLocked
                            ? "Locked"
                            : isPending
                              ? "Confirming..."
                              : "Withdraw LP"}
                        {isPending && (
                          <RefreshCw size={16} className="animate-spin" />
                        )}
                      </span>
                    </button>
                  </div>
                )}

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden shrink-0">
                  <div className="flex items-start gap-3 relative z-10">
                    <Info
                      size={16}
                      className="mt-0.5"
                      style={{ color: BRAND_ACCENT }}
                    />
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white/90">
                        How it works
                      </h4>
                      <p className="text-xs leading-relaxed text-white/50">
                        Deposit USDT to earn yields from protocol trading fees.
                        Your LP shares represent your portion of the pool.
                        Withdrawals have a{" "}
                        <span className="text-white font-bold">
                          7-day cooldown
                        </span>{" "}
                        period after each deposit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Vector Illustration */}
              <div className="hidden h-full lg:flex lg:w-[35%] flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-full flex items-center justify-center h-full">
                  <div className="relative z-10 flex flex-col items-center h-full">
                    {activeTab === "deposit" ? (
                      <>
                        <div
                          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
                          style={{ background: `${BRAND_ACCENT}15` }}
                        >
                          <Coins size={70} style={{ color: BRAND_ACCENT }} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-white">
                          Pool Inflow
                        </h3>
                        <p className="text-center text-sm opacity-50 max-w-[200px]">
                          Inject liquidity into the protocol to earn platform
                          rewards and yields.
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
                        <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-white">
                          Share Burn
                        </h3>
                        <p className="text-center text-sm opacity-50 max-w-[200px]">
                          Exchange your LP tokens for redeemable USDT collateral
                          after the lock period.
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
