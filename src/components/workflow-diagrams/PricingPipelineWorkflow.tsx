import React from "react";
import { PRICING_PIPELINE_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const PricingPipelineWorkflow: React.FC = () => (
  <WorkflowPlayer
    config={PRICING_PIPELINE_CONFIG}
    diagramId="pricing-pipeline"
  />
);
