import React from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  ShieldCheck,
  CandlestickChart,
  Zap
} from "lucide-react";

const BRAND_ACCENT = "#3ef4ff";

const BRAND_CHIPS = [
  {
    icon: ShieldCheck,
    label: "Secured Market"
  },
  {
    icon: CandlestickChart,
    label: "seamless Trading"
  },
  {
    icon: Zap,
    label: "Latency Tuning"
  }
];

const SocialTradingDescription = "Our Social Trading module empowers users to follow and replicate the strategies of top traders in real-time.";
const JupiterMarketDescription = "Jupiter Market is our decentralized exchange (DEX) built on the Solana blockchain, designed to provide users with a seamless and efficient trading experience.";

export const ComingSoon: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-white relative overflow-hidden p-6">
      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center max-w-2xl text-center"
      >
        {/* Animated Icon Section */}
        <div className="relative mb-12">
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-10 rounded-full relative z-10"
            style={{
              background: `radial-gradient(circle, ${BRAND_ACCENT}15 0%, transparent 70%)`,
              border: `1px solid ${BRAND_ACCENT}22`
            }}
          >
            <Rocket size={50} style={{ color: BRAND_ACCENT, filter: `drop-shadow(0 0 15px ${BRAND_ACCENT}66)` }} />
          </motion.div>
        </div>

        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <h1 className="text-3xl font-black tracking-tighter mb-4 uppercase italic">
            LAUNCHING <span style={{ color: BRAND_ACCENT }}>SOON</span>
          </h1>
          <p className="text-md text-white/50 mb-10 max-w-lg leading-relaxed font-medium">
            {type === "social-trading" ? SocialTradingDescription :
              type === "jupiter-market" ? JupiterMarketDescription : "Exciting features are on the horizon! Stay tuned for updates."}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden mb-12 border border-white/5"
        >
          <motion.div
            animate={{ x: ["-100%", "600%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop" as const,
              ease: "easeInOut" as const
            }}            className="w-1/6 h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${BRAND_ACCENT}, transparent)`,
              boxShadow: `0 0 15px ${BRAND_ACCENT}`
            }}
          />
        </motion.div>

        {/* Detail Chips */}
        {type === "social-trading" && (
          <div className="flex flex-wrap justify-center gap-4 mb-12 opacity-60">
            {BRAND_CHIPS.map((chip, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                <chip.icon size={14} style={{ color: BRAND_ACCENT }} />
                {chip.label}
              </div>
            ))}
          </div>
        )
        }

        {/* Action Button */}
        {/* {
          type === "social-trading" && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href="/trade"
                className="group px-8 py-4 rounded-2xl flex items-center gap-3 transition-all relative overflow-hidden"
                style={{
                  background: `${BRAND_ACCENT}15`,
                  border: `1px solid ${BRAND_ACCENT}44`,
                  color: BRAND_ACCENT,
                  fontWeight: "900",
                  fontFamily: "monospace",
                  letterSpacing: "0.1em"
                }}
              >
                <ArrowLeftFromLine size={18} className="group-hover:-translate-x-1 transition-transform" />
                RETURN
                <div className="absolute inset-0 bg-white/5 translate-y-full hover:translate-y-0 transition-transform duration-300" />
              </a>
            </motion.div>
          )} */}
      </motion.div >
    </div >
  );
};
