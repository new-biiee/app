import { m } from "framer-motion";
import {
  Activity,
  Zap,
  Cpu,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

const DISPLAY_FONT = '"Montserrat", "Inter", sans-serif';
const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

type EngineFeature = {
  id: string;
  title: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  formula?: string; // Optional formula for the Math card
};

const ENGINE_FEATURES = [
  {
    id: "MATH-M1",
    title: "Adaptive Reward Surface",
    detail: "Evaluates a polynomial reward surface calibrated on historical tick data, dynamically rescaled by live conditional volatility and Hawkes jump intensity.",
    icon: Activity,
    color: "#3ef4ff",
  },
  {
    id: "MATH-V1",
    title: "Microstructure Analytics",
    detail: "Real-time EGARCH(1,1) volatility estimation and Hawkes self-exciting kernels capture tick clustering and liquidity toxicity (VPIN) signals.",
    icon: Zap,
    color: "#3ef4ff"
  },
  {
    id: "MATH-K1",
    title: "Jump-Diffusion Pricing",
    detail: "Models discrete price gaps using Kou double-exponential distributions to calculate fair-value barrier probabilities in volatile regimes.",
    icon: Cpu,
    color: "#3ef4ff"
  },
  {
    id: "ZK-S1",
    title: "ZK-Proven Settlement",
    detail: "Compiles 15-minute batches into Groth16 proofs via SP1 zkVM, enforcing 28 unique financial and oracle consistency constraints on Solana.",
    icon: ShieldCheck,
    color: "#3ef4ff"
  },
  {
    id: "RISK-R1",
    title: "Fat-Tail Risk Engine",
    detail: "Continuous pool liability tracking using rolling Conditional Value at Risk (CVaR) with Extreme Value Theory (EVT) tail corrections.",
    icon: TrendingUp,
    color: "#3ef4ff"
  },
] as const;

export const EngineCoreCards: React.FC = () => {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {ENGINE_FEATURES.map((item: EngineFeature) => (
        <m.div
          key={item.id}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="group relative rounded-2xl border p-5 overflow-hidden"
          style={{
            background:
              "linear-gradient(165deg, rgba(18, 37, 43, 0.84) 0%, rgba(10, 25, 38, 0.76) 58%, rgba(9, 24, 18, 0.64) 100%)",
            borderColor: "rgba(62, 244, 255, 0.24)",
            boxShadow:
              "0 12px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(62, 244, 255, 0.08), inset 0 -1px 0 rgba(46, 189, 133, 0.08)",
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#3ef4ff]/30 transition-colors">
              <item.icon size={20} color={item.color} strokeWidth={1.5} />
            </div>
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-bold"
              style={{ color: "#7AA8B5", fontFamily: MONO_FONT }}
            >
              {item.id}
            </p>
          </div>

          <h4
            className="text-lg font-bold mb-3 group-hover:text-[#3ef4ff] transition-colors"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            {item.title}
          </h4>
          <p
            className="text-sm text-white/75 leading-relaxed"
            style={{ fontFamily: MONO_FONT }}
          >
            {item.detail}
          </p>
          
          {item.id === "MATH-M1" && (
             <div className="mt-4 flex items-center gap-2 py-1 px-2 rounded bg-[#3ef4ff]/5 border border-[#3ef4ff]/10 w-fit">
                <TrendingUp size={12} color="#3ef4ff" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#3ef4ff]/80" style={{ fontFamily: MONO_FONT }}>
                  Optimized Payout Curve
                </span>
             </div>
          )}
        </m.div>
      ))}
    </div>
  );
};
