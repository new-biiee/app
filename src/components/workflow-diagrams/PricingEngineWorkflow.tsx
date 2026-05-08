import React from "react";
import { PRICING_ENGINE_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const PricingEngineWorkflow: React.FC = () => (
  <WorkflowPlayer config={PRICING_ENGINE_CONFIG} diagramId="pricing-engine" />
);
