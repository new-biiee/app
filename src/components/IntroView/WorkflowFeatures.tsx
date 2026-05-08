import {
  Boxes,
  Cpu,
  ShieldCheck,
  Waves,
} from "lucide-react";

import {
  m,
} from "framer-motion";

import {
  PricingEngineWorkflow,
  SystemArchitectureWorkflow,
} from "./WorkflowDiagrams";

import { useRef, useState, useEffect } from "react";

const BRAND = {
  green: "#3ef4ff",
  pink: "#3ef4ff",
  blue: "#3ef4ff",
  black: "#000000",
};

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

const CORE_FEATURES = [
  {
    id: "price",
    title: "Real-Time Price Feed and Order Settlement",
    summary:
      "Binance BTCUSDT ticks stream through PriceService and drive immediate order outcome checks over WebSocket.",
    bullets: [
      "Ingests Binance WebSocket aggTrade ticks continuously.",
      "Evaluates active 5-second orders on each tick for win/loss.",
      "Broadcasts market updates and order results to clients through Socket.IO.",
    ],
    icon: Waves,
  },
  {
    id: "reserve",
    title: "Batch Assembly (Worker)",
    summary:
      "A dedicated worker process groups settled orders into 1-minute batches for proving and settlement.",
    bullets: [
      "Runs independently from the API server as a background process.",
      "Collects settled orders, OHLC context, and payment deltas for each window.",
      "Builds settlement batch records with Merkle commitments and fee context.",
    ],
    icon: Boxes,
  },
  {
    id: "regime",
    title: "ZK Proof Generation (Keeper)",
    summary:
      "Keeper fetches unprocessed batches, runs SP1 circuits, and outputs Groth16 proofs for settlement verification.",
    bullets: [
      "Polls pending batches from backend settlement endpoints.",
      "Executes SP1 zkVM circuits and produces proof a/b/c plus public hash.",
      "Uses aggregation flow for larger batches to reduce on-chain verification load.",
    ],
    icon: Cpu,
  },
  {
    id: "settlement",
    title: "On-Chain Settlement (Solana PDAs)",
    summary:
      "Verified proofs are committed on-chain to finalize outcomes with replay protection and auditable receipts.",
    bullets: [
      "Calls verify_and_settle with Groth16 proof data from Keeper.",
      "Creates nullifier PDA to prevent replay of already-settled batches.",
      "Stores batch_receipt PDA with merkle_root and emits settlement events for transparency.",
    ],
    icon: ShieldCheck,
  },
  {
    id: "architecture",
    title: "System Architecture (FE to Chain)",
    summary:
      "End-to-end runtime map from frontend and keeper access paths through backend services, storage, prover, and Solana settlement.",
    bullets: [
      "Frontend hits Backend API via REST/JWT and Socket.IO/WSS channels.",
      "Keeper bot uses X-API-KEY and internal bearer routes, then settles on Solana.",
      "Backend/Worker data plane spans PostgreSQL, Redis sessions/rate limits, and ClickHouse OHLC queries.",
    ],
    icon: Cpu,
  },
] as const;

const WORKFLOW_TABS = [
  {
    key: "price",
    label: "Real-Time Price Feed",
    color: BRAND.green,
    Component: PricingEngineWorkflow,
  },
  {
    key: "reserve",
    label: "Proof of Reserve",
    color: BRAND.green,
    Component: SystemArchitectureWorkflow,
  },
  {
    key: "regime",
    label: "Regime Model",
    color: "#3ef4ff",
    Component: SystemArchitectureWorkflow,
  },
  {
    key: "settlement",
    label: "Settlement",
    color: "#3ef4ff",
    Component: SystemArchitectureWorkflow,
  },
  {
    key: "architecture",
    label: "Architecture",
    color: "#3ef4ff",
    Component: SystemArchitectureWorkflow,
  },
] as const;

type TabKey = (typeof WORKFLOW_TABS)[number]["key"];

const WorkflowDiagramTabs: React.FC<{ activeKey?: TabKey; locked?: boolean }> = ({
  activeKey,
  locked = false,
}) => {
  const initialIndex = Math.max(
    0,
    WORKFLOW_TABS.findIndex((item) => item.key === activeKey),
  );
  const [active, setActive] = useState(initialIndex);
  const [isPaused] = useState(locked || false);

  useEffect(() => {
    if (locked) return;
    if (isPaused) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % WORKFLOW_TABS.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isPaused, locked, initialIndex]);

  const displayIndex = locked ? initialIndex : active;
  const { Component } = WORKFLOW_TABS[displayIndex];

  return (
    <div className="space-y-0 w-full h-full">
      {/* <div className="flex flex-wrap gap-2 justify-center relative">
        {isPaused && !locked && (
          <m.button
            onClick={() => setIsPaused(false)}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 340, damping: 24 }}
            className="mt-3 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider transition-all border"
            style={{
              borderColor: "rgba(62,244,255,0.42)",
              color: BRAND.pink,
              background: "rgba(62,244,255,0.16)",
            }}
          >
            RESUME AUTO-SWITCH
          </m.button>
        )}
      </div> */}
      <Component key={displayIndex} />
    </div>
  );
};

export const WorkflowFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<TabKey>(CORE_FEATURES[0].id);
  const featureRef = useRef<HTMLElement | null>(null);
  const currentFeature =
    CORE_FEATURES.find((feature) => feature.id === activeFeature) ??
    CORE_FEATURES[0];
  const CurrentIcon = currentFeature.icon;

  return (
    <section ref={featureRef} className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
        Workflow Integrity Pipeline
      </h2>
      <p
        className="text-sm md:text-base text-white/75 max-w-3xl mb-10"
        style={{ fontFamily: MONO_FONT }}
      >
        From 5-second trade to on-chain finality: Carnot anchors every micro-trade to absolute mathematical certainty maintaing the authenticity of the trade.
      </p>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div
          className="flex lg:flex-col items-center justify-start gap-3 p-2.5 rounded-2xl border self-start"
          style={{
            background:
              "linear-gradient(180deg, rgba(9, 18, 24, 0.9) 0%, rgba(6, 14, 18, 0.88) 100%)",
            borderColor: "rgba(62,244,255,0.2)",
            boxShadow:
              "0 12px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(62,244,255,0.08), inset 0 -1px 0 rgba(46,189,133,0.08)",
          }}
        >
          {CORE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const selected = activeFeature === feature.id;
            return (
              <m.button
                key={feature.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                onMouseEnter={() => setActiveFeature(feature.id)}
                onClick={() => setActiveFeature(feature.id)}
                className="h-11 w-11 rounded-xl border flex items-center justify-center transition-all"
                style={{
                  background: selected
                    ? "linear-gradient(145deg, rgba(62,244,255,0.2) 0%, rgba(46,189,133,0.16) 100%)"
                    : "rgba(255,255,255,0.02)",
                  borderColor: selected
                    ? "rgba(62,244,255,0.56)"
                    : "rgba(255,255,255,0.1)",
                  boxShadow: selected
                    ? "0 0 18px rgba(62,244,255,0.24)"
                    : "none",
                }}
                title={feature.title}
              >
                <Icon size={18} color={selected ? BRAND.pink : "#7AA8B5"} />
              </m.button>
            );
          })}
        </div>

        <div className="flex-1 w-full">
          <div className="flex flex-col xl:flex-row gap-5 h-full">
            <div
              className="xl:w-[360px] rounded-2xl p-5 border h-full"
              style={{
                background:
                  "linear-gradient(165deg, rgba(18, 37, 43, 0.84) 0%, rgba(10, 25, 38, 0.76) 58%, rgba(9, 24, 18, 0.64) 100%)",
                borderColor: "rgba(62,244,255,0.22)",
                boxShadow:
                  "0 14px 38px rgba(0,0,0,0.35), inset 0 1px 0 rgba(62,244,255,0.08), inset 0 -1px 0 rgba(46,189,133,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(62,244,255,0.2) 0%, rgba(46,189,133,0.14) 100%)",
                    border: "1px solid rgba(62,244,255,0.32)",
                  }}
                >
                  <CurrentIcon size={18} color={BRAND.pink} />
                </div>
                <p
                  className="text-[10px] uppercase tracking-[0.18em] font-semibold"
                  style={{ color: "#7AA8B5" }}
                >
                  Workflow Focus
                </p>
              </div>
              <div className="h-[350px] overflow-y-auto">
              <h3 className="text-xl font-bold mb-3">{currentFeature.title}</h3>
              <p
                className="text-sm text-white/75 leading-relaxed mb-3"
                style={{ fontFamily: MONO_FONT }}
              >
                {currentFeature.summary}
              </p>
              <ul className="space-y-2">
                {currentFeature.bullets.map((point) => (
                  <li key={point} className="text-xs text-white/70 leading-relaxed flex items-start gap-2" style={{ fontFamily: MONO_FONT }}>
                    <span style={{ color: BRAND.pink }}>-</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>

            <div
              className="flex w-[800px] justify-center rounded-2xl h-full items-center"
              style={{
                // background:
                //   "linear-gradient(160deg, rgba(7, 18, 24, 0.86) 0%, rgba(4, 10, 14, 0.8) 62%, rgba(8, 20, 16, 0.72) 100%)",
                // borderColor: "rgba(62,244,255,0.2)",
              }}
            >
              <WorkflowDiagramTabs activeKey={activeFeature} locked />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};