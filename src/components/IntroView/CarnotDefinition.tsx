import {
    AnimatePresence,
    m,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "framer-motion";
import React, { useRef, useState } from "react";

import {
    Layers,
    Binary,
    Anchor,
    ShieldCheck,
    Zap
} from "lucide-react";

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';
const ACCENT_RGB = "62,244,255";

const BRAND = {
    accent: "#3ef4ff",
    black: "#000000",
};

const VERTICAL_SPEC = [
    {
        key: "C",
        letters: "C",
        title: "Compressed",
        desc: "SP1 aggregator circuits and background workers compress each 1-minute batch into a single Groth16 proof.",
        enginePart: "Batcher & SP1 Aggregator",
        connection:
            "The Worker process assembles settled orders into chunks; aggregator circuits combine partial proofs for minimal on-chain gas.",
        logic:
            "Batch data is serialized for the SP1 zkVM, transforming thousands of off-chain events into one compact cryptographic update.",
        icon: <Layers size={42} color={BRAND.accent} />,
    },
    {
        key: "A",
        letters: "A",
        title: "Arithmetically",
        desc: "28 cryptographic constraints verify payout math and OHLC price integrity against Pyth oracle checkpoints.",
        enginePart: "ZK Constraint Engine",
        connection:
            "Strict circuit-level logic validates window ordering and multiplier bounds to ensure deterministic results inside the prover.",
        logic:
            "The engine verifies directional price comparisons and pool solvency math using SP1 RISC-V execution.",
        icon: <Binary size={42} color={BRAND.accent} />,
    },
    {
        key: "R",
        letters: "R",
        title: "Root Anchored",
        desc: "Merkle-root commitments anchor batch state to Solana via permanent batch_receipt PDAs.",
        enginePart: "On-Chain Anchor",
        connection:
            "Keepers submit Groth16 proofs to verify_and_settle, creating nullifier PDAs to prevent settlement replay.",
        logic:
            "On-chain verification ties off-chain trade results to a cryptographic root, enabling trustless auditability.",
        icon: <Anchor size={42} color={BRAND.accent} />,
    },
    {
        key: "NO",
        letters: "NO",
        title: "Natively Owned",
        desc: "USDT is secured in program vault PDAs, ensuring users retain non-custodial ownership of all funds.",
        enginePart: "Program Vault PDA",
        connection:
            "Winners utilize Merkle proofs to claim payouts directly from the vault, bypassing third-party custodians.",
        logic:
            "Non-custodial design allows traders to verify inclusion and withdraw collateral via the on-chain ledger.",
        icon: <ShieldCheck size={42} color={BRAND.accent} />,
    },
    {
        key: "T",
        letters: "T",
        title: "Tap-trading",
        desc: "Instant 5-second trading windows powered by sub-second Binance WebSocket price feeds.",
        enginePart: "High-Frequency Price Service",
        connection:
            "The PriceService evaluates in-memory orders every 100ms for immediate feedback before ZK-batch finality.",
        logic:
            "Optimized for rapid BTC directional bets: low-latency off-chain execution secured by a provably-fair ZK pipeline.",
        icon: <Zap size={42} color={BRAND.accent} />,
    },
] as const;

export const CarnotDefinition: React.FC<{ pageRef: React.RefObject<HTMLDivElement | null> }> = ({ pageRef }) => {
    const [activeSpec, setActiveSpec] = useState(0);
    const specRef = useRef<HTMLElement | null>(null);


    const { scrollYProgress: specProgress } = useScroll({
        container: pageRef,
        target: specRef,
        offset: ["start start", "end end"],
    });

    // @ts-expect-ignore
    const specCardShift = useTransform(specProgress, [0, 1], [-16, 16]); void specCardShift;
    useMotionValueEvent(specProgress, "change", (latest) => {
        const section = Math.min(
            VERTICAL_SPEC.length - 1,
            Math.max(0, Math.round(latest * (VERTICAL_SPEC.length - 1))),
        );
        setActiveSpec(section);
    });

    return (
        <section ref={specRef} className="relative h-[300vh]">
            <div className="sticky top-0 h-screen max-w-7xl mx-auto px-6 md:px-8 flex items-center">
                <div className="w-full h-full flex items-center justify-between gap-8 md:gap-12">
                    <div className="w-[20%] max-w-[220px] flex flex-col items-start justify-center">
                        {"CARNOT".split("").map((ch, idx) => {
                            const activeMap = [0, 1, 2, 3, 3, 4];
                            const active = activeMap[idx] === activeSpec;
                            return (
                                <m.div
                                    key={`${ch}-${idx}`}
                                    animate={{
                                        opacity: active ? 1 : 0.34,
                                        textShadow: active ? `0 0 14px ${BRAND.accent}` : "0 0 0 transparent",
                                        color: active ? BRAND.accent : "rgba(255,255,255,0.84)",
                                    }}
                                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                                    className="text-5xl md:text-7xl font-black leading-[0.95] tracking-[-0.04em]"
                                >
                                    {ch}
                                </m.div>
                            );
                        })}
                        <p
                            className="mt-4 text-[11px] tracking-[0.18em] text-white"
                            style={{ fontFamily: MONO_FONT }}
                        >
                            Highly Effecient and Secured, ZK-backed BTC tap-trading
                        </p>
                    </div>

                    <div className="relative min-h-[280px] md:min-h-[420px] w-[80%] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <m.div
                                key={VERTICAL_SPEC[activeSpec].key}
                                initial={{ opacity: 0, y: 24, scale: 0.985 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -24, scale: 0.985 }}
                                transition={{ type: "spring", stiffness: 210, damping: 24 }}
                                className="p-6 md:p-7 w-full flex flex-col justify-between"
                                style={{
                                    borderLeft: `3px solid rgba(${ACCENT_RGB},0.34)`,
                                }}
                            >
                                <div className="flex items-center justify-between mb-3 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div
                                            className="text-[11px] tracking-[0.24em] text-white/60"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            {VERTICAL_SPEC[activeSpec].letters}
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-bold">
                                            {VERTICAL_SPEC[activeSpec].title}
                                        </h3>
                                        <p
                                            className="text-sm md:text-base text-white/60 leading-relaxed"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            {VERTICAL_SPEC[activeSpec].desc}
                                        </p>
                                    </div>
                                    <div className="flex w-[10%] justify-center items-center text-white/90">
                                        {VERTICAL_SPEC[activeSpec].icon}
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3">
                                    <div className="rounded-lg border p-3" style={{ borderColor: `rgba(${ACCENT_RGB},0.28)`, background: "rgba(7, 20, 24, 0.28)" }}>
                                        <p
                                            className="text-[10px] tracking-[0.14em] text-white/48 mb-1"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            SYSTEM ROLE
                                        </p>
                                        <p
                                            className="text-xs md:text-[13px] text-white/80 leading-relaxed"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            {VERTICAL_SPEC[activeSpec].connection}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border p-3" style={{ borderColor: `rgba(${ACCENT_RGB},0.28)`, background: "rgba(7, 20, 24, 0.28)" }}>
                                        <p
                                            className="text-[10px] tracking-[0.14em] text-white/48 mb-1"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            TECHNICAL DETAILS
                                        </p>
                                        <p
                                            className="text-xs md:text-[13px] text-white/80 leading-relaxed"
                                            style={{ fontFamily: MONO_FONT }}
                                        >
                                            {VERTICAL_SPEC[activeSpec].logic}
                                        </p>
                                    </div>
                                </div>
                            </m.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section >
    );
};