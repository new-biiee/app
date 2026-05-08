import React from "react";
import { BARRIER_CORRECTION_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const BarrierCorrectionWorkflow: React.FC = () => (
  <WorkflowPlayer config={BARRIER_CORRECTION_CONFIG} diagramId="barrier-correction" />
);
