import React from "react";
import { VOLATILITY_ENGINE_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const VolatilityEngineWorkflow: React.FC = () => (
  <WorkflowPlayer config={VOLATILITY_ENGINE_CONFIG} diagramId="volatility-engine" />
);
