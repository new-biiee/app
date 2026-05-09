export interface NavPage {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  slug: string;
  pages: NavPage[];
}

export const NAV: NavSection[] = [
  {
    title: "Overview & Welcome",
    slug: "overview",
    pages: [
      { title: "What is Carnot", href: "/documentation/overview/what-is-carnot" },
      { title: "How It Works", href: "/documentation/overview/how-it-works" },
      { title: "Glossary", href: "/documentation/overview/glossary" },
    ],
  },
  {
    title: "Getting Started",
    slug: "getting-started",
    pages: [
      { title: "Installation", href: "/documentation/getting-started/installation" },
      { title: "First Integration", href: "/documentation/getting-started/first-integration" },
    ],
  },
  {
    title: "Core Mechanics",
    slug: "core-mechanics",
    pages: [
      { title: "Trade Lifecycle", href: "/documentation/core-mechanics/trade-lifecycle" },
      { title: "The Price Grid", href: "/documentation/core-mechanics/price-grid" },
      { title: "Price Bands & Outcomes", href: "/documentation/core-mechanics/price-bands" },
      { title: "Settlement Batches", href: "/documentation/core-mechanics/settlement-batches" },
      { title: "Fee Structure", href: "/documentation/core-mechanics/fee-structure" },
    ],
  },
  {
    title: "Fairness & Market Design",
    slug: "fairness",
    pages: [
      { title: "Overview", href: "/documentation/fairness/overview" },
      { title: "Price Feed & Oracle Binding", href: "/documentation/fairness/price-feed" },
      { title: "Reward Rate Model", href: "/documentation/fairness/pricing-model" },
      { title: "Pool Solvency", href: "/documentation/fairness/pool-solvency" },
      { title: "Risk Model", href: "/documentation/fairness/risk-model" },
      { title: "The Complete Model (Vision)", href: "/documentation/fairness/complete-model" },
    ],
  },
  {
    title: "ZK Settlement Protocol",
    slug: "zk-settlement",
    pages: [
      { title: "Overview", href: "/documentation/zk-settlement/overview" },
      { title: "SP1 zkVM & Groth16", href: "/documentation/zk-settlement/sp1-groth16" },
      { title: "Circuit Constraints", href: "/documentation/zk-settlement/circuit-constraints" },
      { title: "Aggregator Circuit", href: "/documentation/zk-settlement/aggregator" },
      { title: "On-Chain Verification", href: "/documentation/zk-settlement/on-chain-verification" },
    ],
  },
  {
    title: "Smart Contracts",
    slug: "smart-contracts",
    pages: [
      { title: "Program Overview", href: "/documentation/smart-contracts/program-overview" },
      { title: "Instructions Reference", href: "/documentation/smart-contracts/instructions" },
      { title: "Settlement Math", href: "/documentation/smart-contracts/settlement-math" },
    ],
  },
  {
    title: "Backend & Real-Time Systems",
    slug: "backend",
    pages: [
      { title: "Architecture", href: "/documentation/backend/architecture" },
      { title: "Order Engine", href: "/documentation/backend/order-engine" },
      { title: "Real-Time Price Feed", href: "/documentation/backend/price-feed" },
      { title: "Batch Assembly", href: "/documentation/backend/batch-assembly" },
      { title: "Keeper Bot", href: "/documentation/backend/keeper-bot" },
    ],
  },
  {
    title: "API Reference",
    slug: "api",
    pages: [
      { title: "Authentication", href: "/documentation/api/authentication" },
      { title: "Trading", href: "/documentation/api/trading" },
      { title: "Account & Payments", href: "/documentation/api/account-payments" },
      { title: "Settlement API", href: "/documentation/api/settlement" },
      { title: "WebSocket Events", href: "/documentation/api/websocket" },
    ],
  },
  {
    title: "Diagrams",
    slug: "diagram",
    pages: [{ title: "Overview", href: "/documentation/diagram/overview" }],
  },
];

/** Flat ordered list of all pages for prev/next navigation */
export const FLAT_PAGES: NavPage[] = NAV.flatMap((s) => s.pages);
