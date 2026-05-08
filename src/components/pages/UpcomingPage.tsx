import { Link } from "react-router-dom";
import { Gift, ArrowLeft, TrendingUp, Users, GitFork } from "lucide-react";
import { motion } from "framer-motion";

const BRAND_ACCENT = "#3ef4ff";

export function UpcomingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  };

  const cardVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden text-gray-200">
      <div
        className="pointer-events-none fixed inset-0 z-0"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 starfield-animated"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.95), transparent), radial-gradient(1px 1px at 22% 18%, rgba(62,244,255,0.92), transparent), radial-gradient(1.2px 1.2px at 15% 32%, rgba(140,252,255,0.88), transparent), radial-gradient(0.8px 0.8px at 32% 8%, rgba(255,255,255,0.87), transparent), radial-gradient(1px 1px at 42% 22%, rgba(62,244,255,0.85), transparent), radial-gradient(1.1px 1.1px at 58% 14%, rgba(255,255,255,0.92), transparent), radial-gradient(0.9px 0.9px at 68% 28%, rgba(62,244,255,0.88), transparent), radial-gradient(1px 1px at 78% 18%, rgba(140,252,255,0.9), transparent), radial-gradient(1.2px 1.2px at 88% 32%, rgba(255,255,255,0.85), transparent), radial-gradient(0.8px 0.8px at 12% 48%, rgba(62,244,255,0.87), transparent), radial-gradient(1px 1px at 28% 55%, rgba(255,255,255,0.91), transparent), radial-gradient(1.1px 1.1px at 45% 42%, rgba(62,244,255,0.89), transparent), radial-gradient(0.9px 0.9px at 62% 58%, rgba(140,252,255,0.86), transparent), radial-gradient(1px 1px at 78% 48%, rgba(255,255,255,0.88), transparent), radial-gradient(1.2px 1.2px at 8% 65%, rgba(62,244,255,0.84), transparent), radial-gradient(0.8px 0.8px at 35% 72%, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 52% 68%, rgba(62,244,255,0.87), transparent), radial-gradient(1.1px 1.1px at 72% 75%, rgba(140,252,255,0.91), transparent), radial-gradient(0.9px 0.9px at 85% 62%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 18% 85%, rgba(62,244,255,0.89), transparent), radial-gradient(1.2px 1.2px at 42% 92%, rgba(255,255,255,0.87), transparent), radial-gradient(0.8px 0.8px at 68% 88%, rgba(62,244,255,0.86), transparent), radial-gradient(1px 1px at 88% 78%, rgba(140,252,255,0.92), transparent)",
          opacity: 0.6,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl px-8 lg:px-12 py-8 flex flex-col min-h-screen">
        {/* Top Navigation Row */}
        <div className="flex justify-between items-center w-full mb-5 lg:mb-10">
          <Link
            to="/documentation/overview/what-is-carnot"
            className="flex items-center text-gray-400 hover:text-white transition-all group"
          >
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all mr-3">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">Go to Docs</span>
          </Link>
          <Link
            to="/trade"
            className="px-8 py-3 bg-[#3ef4ff] text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#3ce5ee] transition-all shadow-[0_0_20px_rgba(62,244,255,0.4)]"
          >
            Continue Trading
          </Link>
        </div>

        {/* Main Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* Left Column: Integrated Hero Content */}
          <div className="flex-1 max-w-xl text-center lg:text-left relative">
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-[#3ef4ff]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center lg:items-start gap-5 relative z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                className="relative"
              >
                <div 
                  className="p-6 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: `rgba(62, 244, 255, 0.08)`,
                    border: `2px solid ${BRAND_ACCENT}`,
                    boxShadow: `0 0 25px rgba(62, 244, 255, 0.3)`,
                  }}
                >
                  <Gift className={`h-12 w-12 text-[${BRAND_ACCENT}]`} />
                </div>
                <div className="absolute -right-2 -top-2 px-2 py-0.5 rounded bg-[#3ef4ff] text-[8px] font-black text-black uppercase tracking-tighter">
                  features
                </div>
              </motion.div>

              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-tight">
                  UPCOMING <br />
                  <span style={{ color: BRAND_ACCENT }} className="not-italic">RELEASES</span>
                </h1>
                <p className="text-md text-[#7AA8B5] font-medium tracking-wide leading-relaxed">
                  We're building the next evolution of derivatives trading. 
                  Stay tuned for game-changing features coming to the Carnot ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Ribbon Cards */}
          <motion.div
            className="flex-1 w-full max-w-2xl space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Feature 1 */}
            <motion.div variants={cardVariants} className="relative group cursor-default">
              <div
                className="relative p-8 bg-gradient-to-r from-gray-900/90 to-black/60 backdrop-blur-md transition-all group-hover:translate-x-2"
                style={{
                  clipPath: "polygon(40px 0, 100% 0, 100% 100%, 40px 100%, 0 50%)",
                  borderRight: `1px solid ${BRAND_ACCENT}33`,
                  borderTop: `1px solid ${BRAND_ACCENT}33`,
                  borderBottom: `1px solid ${BRAND_ACCENT}33`,
                }}
              >
                <div className="flex items-center gap-6 pl-12">
                  <div className="shrink-0 p-3 rounded-xl bg-[#3ef4ff]11 border border-[#3ef4ff]33 text-[#3ef4ff]">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white mb-1 uppercase tracking-wider group-hover:text-[#3ef4ff] transition-colors">
                      Hyper-Dynamic Markets
                    </h2>
                    <p className="text-[#7AA8B5] text-[13px] leading-relaxed">
                      Expanding to JUP/PUMP, memecoins, and RWA derivatives. Unprecedented liquidity for the next generation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={cardVariants} className="relative group cursor-default">
              <div
                className="relative p-8 bg-gradient-to-r from-gray-900/90 to-black/60 backdrop-blur-md transition-all group-hover:translate-x-2"
                style={{
                  clipPath: "polygon(40px 0, 100% 0, 100% 100%, 40px 100%, 0 50%)",
                  borderRight: "1px solid rgba(168, 85, 247, 0.33)",
                  borderTop: "1px solid rgba(168, 85, 247, 0.33)",
                  borderBottom: "1px solid rgba(168, 85, 247, 0.33)",
                }}
              >
                <div className="flex items-center gap-6 pl-12">
                  <div className="shrink-0 p-3 rounded-xl bg-purple-500/11 border border-purple-500/33 text-purple-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white mb-1 uppercase tracking-wider group-hover:text-purple-400 transition-colors">
                      Competitive Social Trading
                    </h2>
                    <p className="text-[#7AA8B5] text-[13px] leading-relaxed">
                      Compete for value extraction in a community-driven ecosystem. Leverage collective intelligence.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={cardVariants} className="relative group cursor-default">
              <div
                className="relative p-8 bg-gradient-to-r from-gray-900/90 to-black/40 backdrop-blur-md transition-all group-hover:translate-x-2"
                style={{
                  clipPath: "polygon(40px 0, 100% 0, 100% 100%, 40px 100%, 0 50%)",
                  borderRight: "1px solid rgba(236, 72, 153, 0.33)",
                  borderTop: "1px solid rgba(236, 72, 153, 0.33)",
                  borderBottom: "1px solid rgba(236, 72, 153, 0.33)",
                }}
              >
                <div className="flex items-center gap-6 pl-12">
                  <div className="shrink-0 p-3 rounded-xl bg-pink-500/11 border border-pink-500/33 text-pink-400">
                    <GitFork className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white mb-1 uppercase tracking-wider group-hover:text-pink-400 transition-colors">
                      Unified Open-Source Engine
                    </h2>
                    <p className="text-[#7AA8B5] text-[13px] leading-relaxed">
                      High-frequency risk and settlement engine for derivatives. Transparent, efficient, and built for scale.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="mt-auto pt-4 text-center lg:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 text-white">
            Carnot Protocol • Secured by Math
          </p>
        </div>
      </div>
    </div>
  );
}
