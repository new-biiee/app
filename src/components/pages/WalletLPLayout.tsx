import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Layers2 } from "lucide-react";
import { WalletView } from "./WalletView";
import { LPView } from "./LPView";

const BRAND_ACCENT = "#3ef4ff";

type TabType = "wallet" | "lp";

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  component: React.FC;
}

const tabs: TabConfig[] = [
  {
    id: "wallet",
    label: "Trade Balance",
    icon: <Wallet size={16} className="relative z-10" />,
    component: WalletView,
  },
  {
    id: "lp",
    label: "Liquidity Pool",
    icon: <Layers2 size={16} className="relative z-10" />,
    component: LPView,
  },
];

export const WalletLPLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("wallet");

  const currentTab = tabs.find((t) => t.id === activeTab);
  const CurrentComponent = currentTab?.component || WalletView;

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 z-40">
        <motion.div
          className="inline-flex rounded-2xl border p-1 backdrop-blur-md"
          style={{
            borderColor: "rgba(62, 244, 255, 0.16)",
          }}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{
                color:
                  activeTab === tab.id
                    ? BRAND_ACCENT
                    : "rgba(255,255,255,0.62)",
              }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="wallet-lp-mode-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(62, 244, 255, 0.1)",
                    border: "1px solid rgba(62, 244, 255, 0.18)",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              {tab.icon}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Offset below floating tabs (same pattern as trading Pool / Social) */}
      <div className="flex flex-1 min-h-0 flex-col pt-15 sm:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="flex h-full min-h-0 w-full flex-col overflow-hidden"
          >
            <CurrentComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
