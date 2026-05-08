import React from "react";
import { SYSTEM_ARCHITECTURE_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const SystemArchitectureWorkflow: React.FC = () => (
  <WorkflowPlayer
    config={SYSTEM_ARCHITECTURE_CONFIG}
    diagramId="system-architecture"
  />
);
