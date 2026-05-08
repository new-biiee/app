import React from "react";
import { RISK_MANAGEMENT_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const RiskManagementWorkflow: React.FC = () => (
  <WorkflowPlayer config={RISK_MANAGEMENT_CONFIG} diagramId="risk-management" />
);
