import { AnimatePresence, m, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  FileJson,
  PlayCircle,
  Binary,
  Send,
  ShieldCheck,
  Receipt,
  Waypoints
} from "lucide-react";
import { useState, useRef } from "react";

const DISPLAY_FONT = '"Montserrat", "Inter", sans-serif';

const BRAND = {
  green: "#3ef4ff",
  pink: "#3ef4ff",
  blue: "#3ef4ff",
  black: "#000000",
};

const MONO_FONT = '"Space Mono", "JetBrains Mono", monospace';

const STEPS = [
  {
    step: "Step 1",
    title: "Batch JSON Input",
    text: "Keeper fetches full batch data from backend (trades, OHLC, deposits, withdrawals) and serializes it as circuit input.",
    icon: FileJson,
  },
  {
    step: "Step 2",
    title: "SP1 Settlement Execution",
    text: "The SP1 program runs settlement logic and checks trade validity, OHLC consistency, payout math, and solvency constraints.",
    icon: PlayCircle,
  },
  {
    step: "Step 3",
    title: "Proof Generation",
    text: "SP1 network or local prover produces Groth16 proof artifacts (a, b, c) plus public hash for verifiable settlement.",
    icon: Binary,
  },
  {
    step: "Step 4",
    title: "Keeper Submission",
    text: "Keeper submits verify_and_settle with batch window, merkle root, public hash, and proof payload to the Solana program.",
    icon: Send,
  },
  {
    step: "Step 5",
    title: "On-Chain Verification",
    text: "carnot_engine verifies the Groth16 proof on-chain and enforces anti-replay checks before accepting settlement.",
    icon: ShieldCheck,
  },
  {
    step: "Step 6",
    title: "Batch Receipt Finality",
    text: "Program writes nullifier and batch_receipt PDAs, records merkle root + window metadata, and emits settlement events.",
    icon: Receipt,
  },
] as const;

const ZKRoadmap: React.FC<{ pageRef: React.RefObject<HTMLDivElement | null> }> = ({ pageRef }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const roadmapRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    container: pageRef,
    target: roadmapRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const section = Math.min(
      STEPS.length - 1,
      Math.max(0, Math.floor(latest * (STEPS.length - 0.05)))
    );
    setActiveStep(section);
    setIsFinished(latest > 0.96);
  });

  const progressLineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={roadmapRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">

          {/* Roadmap Indicators (Left) */}
          <div className="relative flex md:flex-col gap-6 md:gap-10 items-center justify-center py-4 md:py-0 w-full md:w-auto">
            {/* Vertical/Horizontal Line Background */}
            <div className="absolute left-0 md:left-5 top-1/2 md:top-0 w-full md:w-[2px] h-[2px] md:h-full bg-white/10 -translate-y-1/2 md:translate-y-0" />

            {/* Animated Progress Line */}
            <m.div
              className="absolute left-5 top-0 w-[2px] bg-[#3ef4ff] origin-top z-10 hidden md:block"
              style={{ height: progressLineHeight }}
            />
            {/* Mobile Progress Line */}
            <m.div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#3ef4ff] origin-left z-10 md:hidden"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
              }}
            />

            {STEPS.map((step, idx) => {
              const isActive = idx <= activeStep;
              const isCurrent = idx === activeStep;
              const isStepDone = (isActive && !isCurrent) || (idx === 5 && isFinished);
              const Icon = step.icon;

              return (
                <div key={idx} className="relative z-20 flex items-center gap-4">
                  <m.div
                    animate={{
                      scale: isCurrent ? 1.2 : 1,
                      backgroundColor: isActive ? BRAND.green : "rgba(10, 20, 24, 1)",
                      borderColor: isActive ? BRAND.green : "rgba(255,255,255,0.2)",
                      boxShadow: isCurrent ? `0 0 15px ${BRAND.green}` : "none",
                    }}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      color: isActive ? BRAND.black : "white",
                    }}
                  >
                    {isStepDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </m.div>
                  <m.p
                    animate={{
                      opacity: isCurrent ? 1 : 0.4,
                      x: isCurrent ? 0 : -5,
                      color: isCurrent ? BRAND.green : "#7AA8B5",
                    }}
                    className="hidden md:block text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap"
                    style={{ fontFamily: MONO_FONT }}
                  >
                    {step.step}
                  </m.p>
                </div>
              );
            })}
          </div>

          {/* Active Card Content (Right) */}
          <div className="flex-1 w-full relative min-h-[400px] flex flex-col justify-center">
            {/* Fixed Header within Right Content */}
            <div className="max-w-full mb-10 ">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <h2 className="text-2xl md:text-4xl font-extrabold mb-3" style={{ fontFamily: DISPLAY_FONT }}>
                  ZK Settlement Pipeline
                </h2>
                <div className="hidden lg:flex p-3 rounded-2xl border mb-2"
                  style={{
                    borderColor: "rgba(62, 244, 255, 0.15)",
                    background: "linear-gradient(145deg, rgba(62, 244, 255, 0.05) 0%, rgba(46, 189, 133, 0.02) 100%)",
                    boxShadow: "inset 0 0 20px rgba(62, 244, 255, 0.05)"
                  }}
                >
                  <Waypoints size={22} color={BRAND.green} strokeWidth={1.2} />
                </div>
              </div>
              <p
                className="text-xs md:text-base text-white/70 ml-1"
                style={{ fontFamily: MONO_FONT }}
              >
                From batch construction to Groth16 verification on Solana, this
                six-step path converts settled trading data into a final, replay-safe
                on-chain receipt.
              </p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <m.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  <div
                    className="rounded-2xl border p-5 md:p-8"
                    style={{
                      background: "linear-gradient(160deg, rgba(15, 35, 45, 0.95) 0%, rgba(8, 20, 28, 0.9) 62%, rgba(10, 25, 20, 0.85) 100%)",
                      borderColor: "rgba(62, 244, 255, 0.35)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(62, 244, 255, 0.12)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <p
                        className="text-[10px] uppercase tracking-[0.3em] font-bold"
                        style={{ color: BRAND.green, fontFamily: MONO_FONT }}
                      >
                        {STEPS[activeStep].step}
                      </p>
                      <ArrowRight size={14} color={BRAND.green} />
                      <p
                        className="text-[10px] uppercase tracking-[0.3em] font-bold"
                        style={{ color: "#7AA8B5", fontFamily: MONO_FONT }}
                      >
                        Active Stage
                      </p>
                    </div>
                    <h3
                      className="text-xl md:text-2xl font-bold mb-4 text-white"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {STEPS[activeStep].title}
                    </h3>
                    <p
                      className="text-sm md:text-base text-white/80 leading-relaxed"
                      style={{ fontFamily: MONO_FONT }}
                    >
                      {STEPS[activeStep].text}
                    </p>
                  </div>
                </m.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const SettlementConstraintsCards: React.FC = () => {
  const constraints = [
    {
      group: "A1-A5",
      title: "Trade Validity",
      detail:
        "Confirms commitments are well-formed, multiplier bounds are valid, and trade windows are correctly ordered.",
    },
    {
      group: "B1-B6",
      title: "OHLC Validity",
      detail:
        "Checks candle ordering and consistency against trusted oracle checkpoints to prevent malformed market context.",
    },
    {
      group: "C1-C4",
      title: "Outcome Correctness",
      detail:
        "Recomputes directional outcomes and payout values so winners and losers are derived from deterministic rules.",
    },
    {
      group: "D1-D6",
      title: "Pool Solvency",
      detail:
        "Validates net payout and fee accounting to ensure settlement never pushes the pool into insolvency.",
    },
    {
      group: "E1",
      title: "Commitment Integrity",
      detail:
        "Anchors the complete payout set to a Merkle root, allowing auditable post-settlement claims.",
    },
    {
      group: "F1-F3",
      title: "Uniqueness Guarantees",
      detail:
        "Rejects duplicate trade identifiers and zero-stake anomalies to preserve one-trade-one-outcome correctness.",
    },
  ] as const;

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {constraints.map((item) => (
        <m.div
          key={item.group}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="rounded-2xl border p-5"
          style={{
            background:
              "linear-gradient(165deg, rgba(18, 37, 43, 0.84) 0%, rgba(10, 25, 38, 0.76) 58%, rgba(9, 24, 18, 0.64) 100%)",
            borderColor: "rgba(62, 244, 255, 0.24)",
            boxShadow:
              "0 12px 34px rgba(0,0,0,0.35), inset 0 1px 0 rgba(62, 244, 255, 0.08), inset 0 -1px 0 rgba(46, 189, 133, 0.08)",
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
            style={{ color: "#7AA8B5", fontFamily: MONO_FONT }}
          >
            Constraint Group {item.group}
          </p>
          <h4
            className="text-lg font-bold mb-3"
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
        </m.div>
      ))}
    </div>
  );
};

export const ZKComponent: React.FC<{ pageRef: React.RefObject<HTMLDivElement | null> }> = ({ pageRef }) => {
  return (
    <>
      <ZKRoadmap pageRef={pageRef} />

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-18">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
          Settlement Constraints - ZK Circuit
        </h2>
        <p
          className="text-sm md:text-base text-white/75 max-w-5xl mb-6"
          style={{ fontFamily: MONO_FONT }}
        >
          The settlement proof enforces six constraint groups that cover trade
          validity, market data consistency, payout correctness, and anti-replay
          guarantees before final state is accepted on-chain.
        </p>
        <SettlementConstraintsCards />
      </section>
    </>
  );
};