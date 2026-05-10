import React from "react";
import { FULL_SYSTEM_OVERVIEW_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const SystemArchitectureWorkflow: React.FC = () => (
  <WorkflowPlayer
    config={FULL_SYSTEM_OVERVIEW_CONFIG}
    diagramId="full-system-overview"
  />
);
