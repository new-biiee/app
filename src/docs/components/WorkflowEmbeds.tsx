import {
  BarrierCorrectionWorkflow,
  FullSystemOverviewWorkflow,
  PricingEngineWorkflow,
  PricingPipelineWorkflow,
  QuoterWorkflow,
  RiskManagementWorkflow,
  SystemArchitectureWorkflow,
  VolatilityEngineWorkflow,
  ZkSettlementProofWorkflow,
} from "../../components/IntroView/WorkflowDiagrams";
import { WorkflowPlayer } from "../../components/workflow-diagrams/WorkflowCore";
import {
  CRYPTO_ORACLE_BINDING_CONFIG,
  FIVE_LAYER_PRICING_STACK_CONFIG,
  PROVABLE_FAIRNESS_CONFIG,
  TRADE_TO_PAYOUT_CONFIG,
  ZK_SETTLEMENT_PIPELINE_CONFIG,
} from "../../components/workflow-diagrams/docsDiagramConfigs";

export function DocsSettlementFlowDiagram() {
  return (
    <WorkflowPlayer
      config={TRADE_TO_PAYOUT_CONFIG}
      diagramId="trade-to-payout"
    />
  );
}

export function DocsSystemArchitectureDiagram() {
  return <SystemArchitectureWorkflow />;
}

/** Diagram B — centralized black box vs Carnot oracle + ZK */
export function DocsProvableFairnessDiagram() {
  return (
    <WorkflowPlayer
      config={PROVABLE_FAIRNESS_CONFIG}
      diagramId="provable-fairness"
    />
  );
}

/** Diagram D — batch state machine: PENDING → ZK_PROVING → ON_CHAIN */
export function DocsSettlementPipelineDiagram() {
  return (
    <WorkflowPlayer
      config={ZK_SETTLEMENT_PIPELINE_CONFIG}
      diagramId="zk-settlement-pipeline"
    />
  );
}

/** Diagram E — five-layer quantitative stack (judge / vision) */
export function DocsFiveLayerStackDiagram() {
  return (
    <WorkflowPlayer
      config={FIVE_LAYER_PRICING_STACK_CONFIG}
      diagramId="five-layer-stack"
    />
  );
}

/** Diagram F — Pyth checkpoints + 2% circuit binding */
export function DocsOracleBindingDiagram() {
  return (
    <WorkflowPlayer
      config={CRYPTO_ORACLE_BINDING_CONFIG}
      diagramId="oracle-binding"
    />
  );
}

export function DocsVolatilityEngineDiagram() {
  return <VolatilityEngineWorkflow />;
}

export function DocsPricingEngineDiagram() {
  return <PricingEngineWorkflow />;
}

export function DocsBarrierCorrectionDiagram() {
  return <BarrierCorrectionWorkflow />;
}

export function DocsQuoterDiagram() {
  return <QuoterWorkflow />;
}

export function DocsRiskManagementDiagram() {
  return <RiskManagementWorkflow />;
}

export function DocsFullSystemOverviewDiagram() {
  return <FullSystemOverviewWorkflow />;
}

export function DocsZkSettlementProofDiagram() {
  return <ZkSettlementProofWorkflow />;
}

export function DocsPricingPipelineDiagram() {
  return <PricingPipelineWorkflow />;
}
