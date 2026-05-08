import React from "react";
import { ZK_SETTLEMENT_PROOF_CONFIG, WorkflowPlayer } from "./WorkflowCore";

export const ZkSettlementProofWorkflow: React.FC = () => (
  <WorkflowPlayer
    config={ZK_SETTLEMENT_PROOF_CONFIG}
    diagramId="zk-settlement-proof"
  />
);
