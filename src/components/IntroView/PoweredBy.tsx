import {
    AnimatePresence,
    LayoutGroup,
    m,
    useAnimationFrame,
    useMotionValue,
    useTransform,
} from "framer-motion";

import {
    Coins,
    Database,
    Globe,
    Lock,
    Zap,
} from "lucide-react";
import { useState } from "react";
import { SolanaSVGLogo } from "../../constant/solana_logo";

const BRAND = {
    green: "#3ef4ff",
    pink: "#3ef4ff",
    blue: "#3ef4ff",
    black: "#000000",
};


const EngineShellGraphic: React.FC = () => {
    const teeth = Array.from({ length: 16 }, (_, index) => index);

    return (
        <m.svg
            viewBox="0 0 520 520"
            className="absolute inset-0 w-full h-full pointer-events-none"
            initial={{ opacity: 0.68 }}
            animate={{ opacity: [0.64, 0.92, 0.64] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
            <defs>
                <linearGradient id="engineStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3ef4ff" />
                    <stop offset="100%" stopColor="#3ef4ff" />
                </linearGradient>
            </defs>

            <m.circle
                cx="260"
                cy="260"
                r="252"
                fill="none"
                stroke="url(#engineStroke)"
                strokeWidth="1"
                strokeDasharray="22 10"
                animate={{ strokeDashoffset: [0, -220] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <circle
                cx="260"
                cy="260"
                r="230"
                fill="none"
                stroke={BRAND.green}
                strokeOpacity="0.85"
                strokeWidth="3"
            />
            <circle
                cx="260"
                cy="260"
                r="204"
                fill="none"
                stroke={BRAND.blue}
                strokeOpacity="0.6"
                strokeWidth="2.5"
            />

            <path
                d="M260 14v42M260 464v42M14 260h42M464 260h42"
                stroke="url(#engineStroke)"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M104 104l28 28M388 388l28 28M416 104l-28 28M132 388l-28 28"
                stroke="rgba(62,244,255,0.85)"
                strokeWidth="1.8"
                strokeLinecap="round"
            />

            {teeth.map((tooth) => (
                <rect
                    key={tooth}
                    x="256"
                    y="2"
                    width="8"
                    height="36"
                    rx="5"
                    fill={tooth % 2 === 0 ? BRAND.green : BRAND.blue}
                    fillOpacity={tooth % 2 === 0 ? 0.92 : 0.84}
                    transform={`rotate(${tooth * 22.5} 260 260)`}
                />
            ))}

            <circle
                cx="260"
                cy="260"
                r="112"
                fill="none"
                stroke="rgba(62,244,255,0.35)"
                strokeWidth="2"
            />
        </m.svg>
    );
};

const CenterLogoPlaceholder: React.FC = () => {
    return (
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
                className="w-[88px] h-[88px] rounded-full border flex items-center justify-center"
                style={{
                    borderColor: "rgba(232, 62, 255, 0.58)",
                    background:
                        "radial-gradient(circle, rgba(12,30,20,0.96) 0%, rgba(7,18,12,0.9) 76%)",
                    boxShadow:
                        "0 0 16px rgba(242, 62, 255, 0.24), inset 0 0 14px rgba(223, 62, 255, 0.32)",
                }}
            >
                <SolanaSVGLogo className="w-10 h-10 object-contain" />
            </div>
        </div>
    );
};

const SOLANA_CARDS = [
    {
        id: "latency",
        title: "Block Latency",
        detail:
            "With ≈400ms block times, Solana provides the low-latency environment necessary for high-frequency settlement submissions and real-time finality tracking.",
        icon: Zap,
    },
    {
        id: "verify",
        title: "On-Chain Verification",
        detail:
            "The verify_and_settle instruction enables on-chain Groth16 proof verification, where the program enforces nullifier-based anti-replay checks and anchors batch state via batch_receipt PDAs.",
        icon: Database,
    },
    {
        id: "accounts",
        title: "Non-Custodial",
        detail:
            "Solana’s PDA model secures user deposits and protocol state in program-controlled vaults, ensuring that all settlement and withdrawal flows remain auditable and verifiable on-chain.",
        icon: Lock,
    },
    {
        id: "cost",
        title: "Transaction Efficiency",
        detail:
            "By utilizing aggregator circuits for compact proof submission, the engine minimizes on-chain footprints and instruction counts, optimizing transaction costs for 1-minute settlement batches.",
        icon: Coins,
    },
    {
        id: "tooling",
        title: "Anchor Reliability",
        detail:
            "The Anchor framework and its IDL-based development cycle streamline the integration of keeper bots and distribution instructions, ensuring consistent program reliability across updates.",
        icon: Globe,
    },
] as const;

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

export const PoweredBy: React.FC = () => {
    const orbitRotate = useMotionValue(0);
    const iconUprightRotate = useTransform(orbitRotate, (v) => -v);
    const [activeSolana, setActiveSolana] = useState<number | null>(null);
    const [discHoverIndex, setDiscHoverIndex] = useState<number | null>(null);

    useAnimationFrame((_, delta) => {
        if (discHoverIndex !== null) return;
        orbitRotate.set((orbitRotate.get() + delta * 0.005) % 360);
    });

    return (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pt-15 pb-30">
            <div className="flex gap-6 justify-center items-center">
                <div className="mt-4 w-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#3ef4ff] to-transparent mb-6" />
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
                    Powered by Solana
                </h2>
                <div className="mt-4 w-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#3ef4ff] to-transparent mb-6" />
            </div>
            {/* <p
                className="text-sm md:text-base text-white/75 w-5xl mb-4"
                style={{ fontFamily: MONO_FONT }}
            >
                Solana serves as the finality and settlement layer for the Carnot platform, providing the cryptographic foundation required to anchor off-chain computations. The network performs on-chain Groth16 verification, allowing the system to transition from high-speed off-chain execution to permanent, immutable records.
            </p> */}

            <div className="h-[70vh] flex justify-center items-center w-full mt-8">
                <div className="grid grid-cols-2 justify-items-start w-full">
                    <div
                        className="hidden lg:flex items-center justify-center min-h-[460px]"
                        onMouseLeave={() => setActiveSolana(null)}
                        onBlurCapture={() => setActiveSolana(null)}
                    >
                        <div className="relative w-[480px] h-[480px]">
                            <EngineShellGraphic />

                            <m.div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border-2"
                                style={{
                                    borderColor: "rgba(62,244,255,0.72)",
                                    boxShadow: "0 0 24px rgba(62,244,255,0.22), inset 0 0 20px rgba(62,244,255,0.1)",
                                    rotate: orbitRotate,
                                }}
                            >
                                <div
                                    className="absolute inset-[10px] rounded-full pointer-events-none"
                                    style={{
                                        border: "1px solid rgba(62,244,255,0.22)",
                                        boxShadow:
                                            "inset 0 14px 20px rgba(62,244,255,0.08), inset 0 -16px 24px rgba(0,0,0,0.38), 0 18px 26px rgba(0,0,0,0.46)",
                                    }}
                                />
                                <div
                                    className="absolute inset-[24px] rounded-full pointer-events-none"
                                    style={{
                                        background:
                                            "radial-gradient(circle, rgba(62,244,255,0.2) 0%, rgba(62,244,255,0.05) 38%, rgba(0,0,0,0.24) 100%)",
                                        opacity: 0.7,
                                    }}
                                />

                                {SOLANA_CARDS.map((item, index) => {
                                    const center = 180;
                                    const radius = 142;
                                    const angle = (index / SOLANA_CARDS.length) * Math.PI * 2;
                                    const x = center + radius * Math.cos(angle);
                                    const y = center + radius * Math.sin(angle);
                                    const active = activeSolana === index;
                                    const Icon = item.icon;

                                    return (
                                        <m.button
                                            key={item.id}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center border"
                                            style={{
                                                left: `${x}px`,
                                                top: `${y}px`,
                                                color: active ? BRAND.blue : BRAND.green,
                                                borderColor: active
                                                    ? BRAND.blue
                                                    : "rgba(62,244,255,0.7)",
                                                background: active
                                                    ? "rgba(62,244,255,0.14)"
                                                    : "rgba(62,244,255,0.14)",
                                                boxShadow: active
                                                    ? `0 0 18px ${BRAND.blue}`
                                                    : "none",
                                                rotate: iconUprightRotate,
                                            }}
                                            whileHover={{ scale: 1.16 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                            onMouseEnter={() => {
                                                setActiveSolana(index);
                                                setDiscHoverIndex(index);
                                            }}
                                            onMouseLeave={() => {
                                                setActiveSolana(null);
                                                setDiscHoverIndex(null);
                                            }}
                                        >
                                            <Icon size={18} />
                                        </m.button>
                                    );
                                })}

                                <m.div
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border"
                                    style={{
                                        borderColor: "rgba(62,244,255,0.58)",
                                        background:
                                            "radial-gradient(circle, rgba(62,244,255,0.36) 0%, rgba(7,18,12,0.9) 74%)",
                                        boxShadow:
                                            "0 0 22px rgba(255, 62, 232, 0.3), inset 0 0 18px rgba(213, 62, 255, 0.36)",
                                        rotate: orbitRotate,
                                    }}
                                />
                            </m.div>
                            <div
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[136px] w-[316px] h-[88px] rounded-[50%] pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(ellipse at center, rgba(62,244,255,0.22) 0%, rgba(62,244,255,0.08) 30%, rgba(0,0,0,0.02) 72%, rgba(0,0,0,0) 100%)",
                                    filter: "blur(10px)",
                                }}
                            />
                            <CenterLogoPlaceholder />
                        </div>
                    </div>

                    <LayoutGroup id="solana-powered-cards">
                        <div className="flex flex-col gap-3 relative min-h-[460px] w-full my-4">
                            {SOLANA_CARDS.map((item, index) => {
                                const isFocused = discHoverIndex === index;
                                const active = activeSolana === index || isFocused;
                                const Icon = item.icon;

                                return (
                                    <m.div
                                        key={item.id}
                                        layout
                                        layoutId={`solana-card-${item.id}`}
                                        className="rounded-xl border p-4 w-full"
                                        style={{
                                            borderColor: active
                                                ? BRAND.blue
                                                : "rgba(255,255,255,0.14)",
                                            background: active
                                                ? "rgba(62,244,255,0.14)"
                                                : "rgba(62,244,255,0.1)",
                                            zIndex: isFocused ? 10 : 1,
                                        }}
                                        whileHover={{ x: 4 }}
                                        transition={{
                                            layout: {
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30,
                                            },
                                            default: { duration: 0.2 },
                                        }}
                                        onMouseEnter={() => {
                                            setActiveSolana(index);
                                            setDiscHoverIndex(index);
                                        }}
                                        onMouseLeave={() => {
                                            setActiveSolana(null);
                                            setDiscHoverIndex(null);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{
                                                    background: active
                                                        ? "rgba(62,244,255,0.2)"
                                                        : "rgba(62,244,255,0.18)",
                                                }}
                                            >
                                                <Icon
                                                    size={16}
                                                    color={active ? BRAND.blue : BRAND.green}
                                                />
                                            </div>
                                            <h3 className="font-bold">{item.title}</h3>
                                        </div>
                                        <AnimatePresence>
                                            {isFocused && (
                                                <m.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p
                                                        className="text-sm text-white/75 leading-relaxed mt-2"
                                                        style={{ fontFamily: MONO_FONT }}
                                                    >
                                                        {item.detail}
                                                    </p>
                                                </m.div>
                                            )}
                                        </AnimatePresence>
                                    </m.div>
                                );
                            })}
                        </div>
                    </LayoutGroup>
                </div>
            </div>
        </section>
    );
};