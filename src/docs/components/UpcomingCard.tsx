import { Link } from "react-router-dom";
import { Gift, PartyPopper, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const BRAND_ACCENT = "#3ef4ff";
const BRAND_ACCENT_BACKDROP = "rgba(68, 186, 255, 0.2)";

export function UpcomingCard() {
  const icons = [Gift, PartyPopper, TrendingUp];
  const iconHeight = 16; // Corresponds to h-4 (tailwind default)

  return (
    <Link
      to="/upcoming"
      className="flex items-center gap-2 rounded-lg bg-cyan-400/40 px-4 py-2 text-xs text-gray-300 hover:bg-cyan-400/20 transition-colors relative overflow-hidden group"
      style={{
        boxShadow: `0 0 15px ${BRAND_ACCENT_BACKDROP}`, // Keep the glow
      }}
    >
      {/* Spinning Icon Container */}
      <div className="relative h-4 w-4 overflow-hidden">
        <motion.div
          animate={{ y: [0, -iconHeight, -2 * iconHeight, -3 * iconHeight] }} // Animate through each icon, then to the duplicate for seamless loop
          transition={{
            duration: 6, // Total duration for one full scroll through all icons
            ease: "linear" as const, // Linear ease for smooth continuous motion
            repeat: Infinity, // Loop infinitely
            repeatType: "loop" as const, // Restarts from the beginning after each cycle
            times: [0, 0.33, 0.66, 1], // Corresponding time for each y keyframe
            delay: 1, // Initial delay before the animation starts
            repeatDelay: 0.5, // Delay between repetitions of the entire sequence
          }}
          className="flex flex-col"
        >
          {icons.map((Icon, idx) => (
            <div key={idx} className="h-4 w-4 flex items-center justify-center shrink-0">
              <Icon className={`h-4 w-4 text-[${BRAND_ACCENT}]`} />
            </div>
          ))}
          {/* Duplicate the first icon to create a seamless loop transition */}
          {icons[0] && (() => {
            const FirstIcon = icons[0];
            return (
              <div key="duplicate-0" className="h-4 w-4 flex items-center justify-center shrink-0">
                <FirstIcon className={`h-4 w-4 text-[${BRAND_ACCENT}]`} />
              </div>
            );
          })()}
        </motion.div>
      </div>

      <span className="font-semibold text-white">Upcoming!</span>
      <span className="hidden sm:inline text-white/90">New Features on the Way!</span>
      
      {/* Visual flair for the card */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shine"></div>
    </Link>
  );
}
