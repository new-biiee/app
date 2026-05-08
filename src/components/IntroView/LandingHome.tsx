import React, { useMemo, useState, useEffect } from "react";
import {
  m,
  AnimatePresence,
} from "framer-motion";

import { Link } from "react-router-dom";
import {
  Lock,
  Zap,
} from "lucide-react";

import { SolanaSVGLogo } from "../../constant/solana_logo";

const BRAND = {
  green: "#3ef4ff",
  pink: "#3ef4ff",
  blue: "#3ef4ff",
  black: "#000000",
};

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

const HERO_PREFIX_1 = "Experience the thrill of 5-second predictions trading through";
const HERO_POINTS = [
  "Compressed Markets",
  "Arithmetically Powered Algorithms",
  "Root Anchored Commitments",
  "Natively Owned Wallets",
  "Tap-trading Platform",
];

const HeroMirrorStripes: React.FC<{ ctaHover: boolean }> = ({ ctaHover }) => {
  const viewWidth = 1200;
  const viewHeight = 720;
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: 18 + ((i * 73) % 1160),
        y: 16 + ((i * 97) % 688),
        r: 0.8 + (i % 3) * 0.45,
        twinkle: 0.3 + (i % 5) * 0.06,
        driftX: 10 + (i % 7) * 2.6,
        driftY: 8 + (i % 5) * 2.1,
        driftDuration: 6.5 + (i % 8) * 0.9,
        delay: (i % 9) * 0.35,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="stripeGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(140,252,255,0.98)" />
            <stop offset="45%" stopColor="rgba(92,246,255,1)" />
            <stop offset="100%" stopColor="rgba(62,244,255,0.92)" />
          </linearGradient>
          <filter id="stripeBloom" x="-40%" y="-40%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <m.path
          d="M -70 -10 L 198 298 Q 236 346 198 396 L -18 742"
          fill="none"
          stroke="url(#stripeGlow)"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#stripeBloom)"
          animate={{
            opacity: ctaHover ? 0.94 : 0.78,
            strokeWidth: ctaHover ? 52 : 44,
          }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <m.path
          d="M 1270 -10 L 1002 298 Q 964 346 1002 396 L 1218 742"
          fill="none"
          stroke="url(#stripeGlow)"
          strokeWidth="44"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#stripeBloom)"
          animate={{
            opacity: ctaHover ? 0.94 : 0.78,
            strokeWidth: ctaHover ? 52 : 44,
          }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
        />

        <m.path
          d="M -50 2 L 206 302 Q 232 340 206 380 L -6 730"
          fill="none"
          stroke="rgba(140,252,255,0.58)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            opacity: ctaHover ? 0.76 : 0.44,
            strokeWidth: ctaHover ? 28 : 22,
          }}
          transition={{ duration: 0.95, ease: [0.22, 0.61, 0.36, 1] }}
        />
        <m.path
          d="M 1250 2 L 994 302 Q 968 340 994 380 L 1206 730"
          fill="none"
          stroke="rgba(140,252,255,0.58)"
          strokeWidth="22"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            opacity: ctaHover ? 0.76 : 0.44,
            strokeWidth: ctaHover ? 28 : 22,
          }}
          transition={{ duration: 0.95, ease: [0.22, 0.61, 0.36, 1] }}
        />

        {stars.map((star) => (
          <m.circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="rgba(255,255,255,0.95)"
            animate={{
              cx: [star.x - star.driftX, star.x + star.driftX, star.x - star.driftX],
              cy: [star.y - star.driftY, star.y + star.driftY, star.y - star.driftY],
              opacity: [star.twinkle, 0.96, star.twinkle],
            }}
            transition={{
              duration: star.driftDuration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
};


export const LandingHome: React.FC = () => {
  const [heroCtaHover, setHeroCtaHover] = useState(false);
  const [pointIndex, setPointIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointIndex((prev) => (prev + 1) % HERO_POINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-6 md:px-10"
    >
      <HeroMirrorStripes ctaHover={heroCtaHover} />
      <div className="relative z-10 text-center max-w-4xl">
        <m.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 190, damping: 18 }}
          className="text-base md:text-xl font-semibold tracking-[0.02em] text-white/90"
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(148,232,242,1) 0%, rgba(81,161,171,1) 100%)",
            }}
          >
            Bringing High-Frequency Derivatives to Solana
          </span>
          {" "}
        </m.p>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 190, damping: 18, delay: 0.05 }}
          className="mt-3 text-6xl md:text-8xl font-black tracking-[-0.08em]"
        >
          CARNOT
        </m.h1>
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="h-1 w-16 bg-gradient-to-r from-[#3ef4ff]/0 to-[#3ef4ff] rounded-full" />
          <div>World's Most Advanced & Secure Tap Trading Platform</div>
          <div className="h-1 w-16 bg-gradient-to-r from-[#3ef4ff] to-[#3ef4ff]/0 rounded-full" />
        </div>
        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 18,
            delay: 0.08,
          }}
          className="mt-4 text-sm md:text-base text-white/80 leading-relaxed flex flex-col items-center md:items-center text-center md:text-left gap-y-1"
          style={{ fontFamily: MONO_FONT }}
        >
          <span className="shrink-0">{HERO_PREFIX_1}</span>
          <span className="inline-grid grid-cols-1 grid-rows-1 justify-items-start">
            {/* Invisible placeholder of the longest string to reserve layout space */}
            {/* <span className="invisible row-start-1 col-start-1 h-0 pointer-events-none px-1 font-bold whitespace-nowrap">
              {HERO_POINTS.reduce((a, b) => a.length > b.length ? a : b)}
            </span> */}

            <AnimatePresence mode="wait">
              <m.span
                key={pointIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ color: BRAND.green }}
                className="font-bold whitespace-nowrap"
              >
                {HERO_POINTS[pointIndex]}
              </m.span>
            </AnimatePresence>
          </span>
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 170,
            damping: 18,
            delay: 0.16,
          }}
          className="mt-10"
        >
          <Link
            to="/trade"
            className="group relative inline-flex items-center justify-center px-8 py-3 text-xs md:text-sm font-bold tracking-[0.18em] overflow-hidden rounded-full"
            onMouseEnter={() => setHeroCtaHover(true)}
            onMouseLeave={() => setHeroCtaHover(false)}
            style={{
              fontFamily: MONO_FONT,
              border: `1px solid ${BRAND.pink}`,
              color: "#fff",
              background: "transparent",
              boxShadow: `0 0 0 ${BRAND.pink}`,
            }}
          >
            <m.span
              className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/35 blur-sm"
              animate={{ x: ["-200%", "420%"] }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                repeatDelay: 1.7,
                type: "spring",
                stiffness: 90,
                damping: 16,
              }}
            />
            <m.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10"
            >
              LAUNCH APPLICATION
            </m.span>
          </Link>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 20, delay: 0.22 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-white/80"
          style={{ fontFamily: MONO_FONT }}
        >
          <div className="inline-flex items-center gap-2 px-2">
            <SolanaSVGLogo className="w-4 h-4 object-contain" />
            <span>Powered by Solana</span>
          </div>
          <span className="text-white/40">|</span>
          <div className="inline-flex items-center gap-2 px-2">
            <Lock size={14} color={BRAND.blue} />
            <span>Secured by ZK algorithm</span>
          </div>
          <span className="text-white/40">|</span>
          <div className="inline-flex items-center gap-2 px-2">
            <Zap size={14} color={BRAND.blue} />
            <span>Less than 300ms latency</span>
          </div>
        </m.div>
      </div>
    </section>
  )
};