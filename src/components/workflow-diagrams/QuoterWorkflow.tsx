import React from "react";
import { QUOTER_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const QuoterWorkflow: React.FC = () => (
  <WorkflowPlayer config={QUOTER_CONFIG} diagramId="quoter" />
);
