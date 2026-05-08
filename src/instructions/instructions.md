# Project: CARNOT - The Ideal Trading Engine
**Theme:** High-Frequency DeFi / Cryptographic Engineering
**Colors:** Green (#30654d), Pink (#897ff1), Black (#000000)
**Tech Stack:** React, Vite, Framer Motion, Tailwind CSS, Lucide React (Icons)

---

## Global Configuration
- **Background:** Solid Black (#000000) with subtle noise texture.
- **Typography:** - Headlines: Geometric Sans-Serif (e.g., 'Inter' or 'Montserrat')
  - Data/Labels: Monospaced (e.g., 'JetBrains Mono' or 'Space Mono')
- **Transitions:** All animations must use `framer-motion` spring physics for a "snappy" industrial feel.

---

## Section 1: Hero - The Ignition
**Layout:** 100vh, Full viewport.
- **Background Element:** Two large "L" shaped glowing stripes. 
  - Style: Width 2px, blurred outer glow (Pink #897ff1).
  - Transform: Tilted at 35 degrees. 
  - Animation: Subtle floating motion or "pulse" along the stripe path using `animate={{ opacity: [0.4, 0.8, 0.4] }}`.
- **Center Content:**
  - **H1:** "CARNOT" (Bold, tracking-tighter).
  - **Subtitle:** "'Ideal Engine' of DeFi—powered by ZK-cryptography and high-frequency math."
- **CTA:** "Launch Application" button.
  - **Design:** Pink border, transparent background, neon glow on hover.
  - **Animation:** `whileHover={{ scale: 1.05 }}` and a "scan-line" light effect passing through the button every 3 seconds.

---

## Section 2: The CARNOT Vertical Spec
**Mechanism:** Scroll-linked animation using `framer-motion`'s `useScroll`.
- **Layout:** Sticky container (height 300vh).
- **Behavior:** As the user scrolls, the word "CARNOT" breaks into vertical letters on the left side.
- **Letter Highlight:** - Each letter starts at 30% opacity (Green #30654d).
  - When the corresponding definition is in view, the letter glows vibrant Pink (#897ff1).
- **Content (Right Side):**
  - **C:** **Compressed** — ZK-proofs bundle 10,000+ trades into one atomic update.
  - **AR:** **Arithmetically** — Precision grid-bands ($20 intervals) ensure mathematical certainty.
  - **NO:** **Natively Owned** — Non-custodial vault architecture ensures users retain full control of assets.
  - **T:** **Tap-trading** — The 5-second window. One tap. Instant settlement.

---

## Section 3: Core Features - ZK Integrity
**Mechanism:** Vertical line stepper.
- **Layout:** Left column (Stepper line), Right column (Feature Cards).
- **Stepper:** A vertical Green (#30654d) line that fills with Pink (#897ff1) as the user scrolls.
- **Features:** 
  - **ZK-Proof Aggregation:** How we prove trade correctness without revealing user data.
  - **Mathematical Solvency:** Constant CVaR checks to protect the LP pool.
  - **Off-chain Price Validation:** Using Brownian Bridge to verify price "touches" without on-chain oracles.
- **Workflow Placeholder:** In the `IntroView.tsx`, there is `WorkflowDiagramTabs` which has code for individual workflow diagrams, same workflow diagram should be integrated based on feature.

---

## Section 4: How the Engine Fires
**Layout:** Horizontal Flex-row. Full-width cards.
- **Design:** Glassmorphism (Background: `rgba(48, 101, 77, 0.1)`, `backdrop-filter: blur(12px)`, Border: `1px solid rgba(137, 127, 241, 0.3)`).
- **Flow:**
  - **Card 1 (Input):** User triggers a "Tap" event.
  - **Arrow:** Animated Pink arrow pointing right.
  - **Card 2 (Math):** Brownian Bridge logic verifies price "touches" off-chain.
  - **Arrow:** Animated Pink arrow pointing right.
  - **Card 3 (Finality):** ZK-Proof committed to Solana via Keeper race.
- **Hover:** Cards should lift and glow when hovered.

---

## Section 5: Powered by Solana
**Mechanism:** Interactive Interactive Circle + Vertical Card Sync.
- **Left Column:** A rotating (slow) circle with 4-5 icons (Speed, Security, Low Cost, Scalability). 
- **Right Column:** Vertical stack of cards detailing Solana's role (400ms blocks, Anchor Framework, etc.).
- **Interaction:** - `onHover` of a Card: The corresponding icon on the circle scales up and switches color from Green to Pink.
  - `onHover` of an Icon: The corresponding Card displays a Pink outer border.

---

## Section 6: Footer - Terminal Exit
**Layout:** 3-column grid, minimalist.
- **Left:** CARNOT logo in neon green. "Built for the limit."
- **Center:** - Link List: [GitHub, Documentation, Audit Report, Security Policy].
  - Hover effect: Pink underline slide-in.
- **Right:** - System Status: Green dot pulsing next to "NETWORK: OPERATIONAL".
  - Timestamp: Live UTC clock in Monospaced font.
- **Bottom:** Copyright © 2026 CARNOT ENGINE.

---

## Implementation Notes for Agent:
1. **Performance:** Use `framer-motion` `LazyMotion` to reduce bundle size.
2. **Responsiveness:** On mobile, Section 4 (Horizontal Cards) should stack vertically, and Section 5 (Circle) should be hidden or moved to top.
3. **Glass Effects:** Ensure all glass cards use a subtle Green tint (#30654d) to maintain theme consistency.