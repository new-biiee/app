import React, { useRef } from "react";
import {
  LazyMotion,
  domAnimation,
} from "framer-motion";

// import { CarnotDefinition } from "../IntroView/CarnotDefinition";
import { PoweredBy } from "../IntroView/PoweredBy";
import { WorkflowFeatures } from "../IntroView/WorkflowFeatures";
import { ZKComponent } from "../IntroView/ZKComponent";
import { Footer } from "../layout/Footer";
import { LandingHome } from "../IntroView/LandingHome";

export const IntroView: React.FC = () => {
  const pageRef = useRef<HTMLDivElement | null>(null);

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={pageRef}
        className="relative h-full overflow-y-auto overflow-x-hidden text-white"
        style={{
          background:
            "radial-gradient(80% 80% at 14% 10%, rgba(62,244,255,0.16), transparent 56%), radial-gradient(70% 70% at 84% 88%, rgba(62,244,255,0.12), transparent 58%), linear-gradient(145deg, #010203 0%, #020304 38%, #010203 100%)",
        }}
      >

        <div
          className="absolute -top-20 -left-24 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(62,244,255,0.16), transparent 72%)",
          }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full blur-[140px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(62,244,255,0.14), transparent 74%)",
          }}
        />

        <LandingHome />

        <PoweredBy />
        {/* <CarnotDefinition pageRef={pageRef} /> */}

        <WorkflowFeatures />

        <ZKComponent pageRef={pageRef} />


        <Footer />
      </div>
    </LazyMotion>
  );
};
