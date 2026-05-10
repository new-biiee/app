import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SolanaSVG from '../../assets/icons/solana_svg.svg?react';
import PostgresSVG from '../../assets/icons/postgresql_svg.svg?react';
import ApproverSVG from '../../assets/icons/approver_svg.svg?react';
import BackendSVG from '../../assets/icons/backend_svg.svg?react';
import ClickHouseSVG from '../../assets/icons/clickhouse_svg.svg?react';
import FrontendSVG from '../../assets/icons/frontend_svg.svg?react';
import KeeperSVG from '../../assets/icons/keeper_svg.svg?react';
import RedisSVG from '../../assets/icons/redis_svg.svg?react';
import WorkerSVG from '../../assets/icons/worker_svg.svg?react';

// ________ ICON Imports ________
const getSVGIcon = (
  type: string | undefined,
  x: number,
  y: number,
  size: number,
): React.ReactNode => {
  const defalutProps = {
    x: x - size * 0.3,
    y: y - size * 0.3,
    width: size * 0.6,
    height: size * 0.6,
  };

  if (type === "solana") return <SolanaSVG {...defalutProps} />
  if (type === "postgres") return <PostgresSVG {...defalutProps} />
  if (type === "approver") return <ApproverSVG {...defalutProps} />
  if (type === "backend") return <BackendSVG {...defalutProps} />
  if (type === "clickhouse") return <ClickHouseSVG {...defalutProps} />
  if (type === "frontend") return <FrontendSVG {...defalutProps} />
  if (type === "worker") return <WorkerSVG {...defalutProps} />
  if (type === "keeper") return <KeeperSVG {...defalutProps} />
  if (type === "redis") return <RedisSVG {...defalutProps} />
  return null;
};

// ─── Shared Types ────────────────────────────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: "rect" | "rounded" | "circle" | "blob" | "network" | "icon";
  color: string;
  icon?: string;
  fill?: string;
  border?: string;
  processing?: boolean;
  iconType?: string;
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  label?: string;
  labelPos?: { x: number; y: number };
  dashed?: boolean;
  curved?: boolean;
  cp?: { x: number; y: number };
}

interface StepDef {
  edgeId: string;
  desc: string;
}

interface GroupBoxDef {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface WorkflowConfig {
  title: string;
  subtitle: string;
  accentColor: string;
  labelScale?: number;
  width: number;
  height: number;
  nodes: NodeDef[];
  edges: EdgeDef[];
  steps: StepDef[];
  groupBox?: GroupBoxDef;
  groupBoxes?: GroupBoxDef[];
}

// ─── Network Icon (blockchain/smart-contract node look) ──────────────────────
const NetworkIcon: React.FC<{
  cx: number;
  cy: number;
  r: number;
  color: string;
}> = ({ cx, cy, r, color }) => {
  const pts = [
    { x: cx, y: cy - r },
    { x: cx + r * 0.87, y: cy - r * 0.5 },
    { x: cx + r * 0.87, y: cy + r * 0.5 },
    { x: cx, y: cy + r },
    { x: cx - r * 0.87, y: cy + r * 0.5 },
    { x: cx - r * 0.87, y: cy - r * 0.5 },
  ];
  const edges2 = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
    [0, 3],
    [1, 4],
    [2, 5],
  ];
  return (
    <g>
      {edges2.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a].x}
          y1={pts[a].y}
          x2={pts[b].x}
          y2={pts[b].y}
          stroke={color}
          strokeWidth={1.5}
          opacity={0.9}
        />
      ))}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={r * 0.15}
          fill={color}
          opacity={0.9}
        />
      ))}
    </g>
  );
};

// ______________ Icon Node ________________
const IconNode: React.FC<{
  x: number;
  y: number;
  size: number;
  borderColor: string;
  color?: string;
  type?: string;
}> = ({ x, y, size, borderColor, color, type }) => {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={size / 1.9}
        fill={color ? color + "25" : "transparent"}
        stroke={borderColor}
        strokeWidth={2}
      />
      {getSVGIcon(type, x, y, size)}
      <defs>
        {type === "solana" ? (
          <linearGradient id="solana-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00ffa250" />
            <stop offset="100%" stopColor="#dd1fff5c" />
          </linearGradient>
        ) : (<></>)}
      </defs>
    </g>);
};

// Removed generic ArrowDefs since markers are generated per-edge

// ─── Single node renderer ─────────────────────────────────────────────────────
const WorkflowNode: React.FC<{
  node: NodeDef;
  active?: boolean;
  visited?: boolean;
  labelScale?: number;
}> = ({ node, active, visited, labelScale = 1 }) => {
  const {
    x,
    y,
    w,
    h,
    shape = "rounded",
    color,
    label,
    icon,
    fill,
    processing,
    iconType,
  } = node;

  const nodeOpacity = visited ? 1 : 0.4;
  const strokeWidth = active ? 3 : 2;
  const labelFontSize = 11 * labelScale;
  const multiLineOffset = 12 * labelScale;

  if (shape === "network") {
    return (
      <g style={{ opacity: nodeOpacity }}>
        <NetworkIcon cx={x} cy={y} r={w / 2} color={color} />
        <text
          x={x}
          y={y + w / 2 + 14}
          textAnchor="middle"
          fontSize={labelFontSize}
          fill={color}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight="500"
        >
          {label}
        </text>
      </g>
    );
  }

  if (shape === "icon") {
    return (
      <g style={{ opacity: nodeOpacity }}>
        <IconNode x={x} y={y} size={w} borderColor={color} color={color} type={iconType} />
        <text
          x={x}
          y={y + w / 2 + 14}
          textAnchor="middle"
          fontSize={labelFontSize}
          fill={color}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight="500"
        >
          {label}
        </text>
      </g>
    )
  };

  if (shape === "circle") {
    return (
      <g style={{ opacity: nodeOpacity }}>
        <circle
          cx={x}
          cy={y}
          r={w / 2}
          fill={fill || `${color}14`}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        {icon && (
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={18}
          >
            {icon}
          </text>
        )}
        <text
          x={x}
          y={y + w / 2 + 14}
          textAnchor="middle"
          fontSize={labelFontSize}
          fill={color}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight="500"
        >
          {label}
        </text>
      </g>
    );
  }

  // rect / rounded (default)
  const rx = shape === "rounded" ? 10 : 4;
  const lines = label.split("\n");

  return (
    <g style={{ opacity: nodeOpacity }}>
      {fill && (
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={rx}
          fill={fill}
          opacity={0.25}
        />
      )}
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={fill ? "transparent" : `${color}3d`}
        strokeWidth={strokeWidth}
      />
      {icon && (
        <text
          x={x + w / 2 - 8}
          y={y - h / 2 + 16}
          textAnchor="middle"
          fontSize={13}
          opacity={0.8}
        >
          {icon}
        </text>
      )}
      {processing && (
        <g opacity={0.9}>
          <circle
            cx={x + w / 2 - 24}
            cy={y - h / 2 + 16}
            r={6}
            fill="none"
            stroke={fill ? "#ffffff" : color}
            strokeWidth={1.5}
            strokeDasharray="10 6"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${x + w / 2 - 24} ${y - h / 2 + 16}`}
              to={`360 ${x + w / 2 - 24} ${y - h / 2 + 16}`}
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
      {lines.map((ln, i) => (
        <text
          key={i}
          x={x}
          y={
            y +
            (lines.length === 1
              ? 0
              : (i - (lines.length - 1) / 2) * multiLineOffset)
          }
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={labelFontSize}
          fill={color}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight="600"
        >
          {ln}
        </text>
      ))}
    </g>
  );
};

// ─── Edge renderer ────────────────────────────────────────────────────────────
function getShapeOffset(node: NodeDef, targetX: number, targetY: number) {
  const dx = targetX - node.x;
  const dy = targetY - node.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;

  if (node.shape === "circle" || node.shape === "network") {
    const r = node.w / 2 + 2;
    return { dx: ux * r, dy: uy * r };
  } else {
    const hw = node.w / 2 + 2;
    const hh = node.h / 2 + 2;
    const off = Math.min(
      Math.abs(hw / (ux === 0 ? 0.001 : ux)),
      Math.abs(hh / (uy === 0 ? 0.001 : uy)),
    );
    return { dx: ux * off, dy: uy * off };
  }
}

function computeEdgePath(
  fromNode: NodeDef,
  toNode: NodeDef,
  edge: EdgeDef,
): { d: string; midX: number; midY: number } {
  if (edge.curved && edge.cp) {
    const { cp } = edge;
    const fOff = getShapeOffset(fromNode, cp.x, cp.y);
    const sx = fromNode.x + fOff.dx;
    const sy = fromNode.y + fOff.dy;

    const tOff = getShapeOffset(toNode, cp.x, cp.y);
    const ex = toNode.x + tOff.dx;
    const ey = toNode.y + tOff.dy;

    const d = `M ${sx} ${sy} Q ${cp.x} ${cp.y} ${ex} ${ey}`;
    const midX = (sx + 2 * cp.x + ex) / 4;
    const midY = (sy + 2 * cp.y + ey) / 4;
    return { d, midX, midY };
  }

  const fOff = getShapeOffset(fromNode, toNode.x, toNode.y);
  const tOff = getShapeOffset(toNode, fromNode.x, fromNode.y);

  const sx = fromNode.x + fOff.dx;
  const sy = fromNode.y + fOff.dy;
  const ex = toNode.x + tOff.dx;
  const ey = toNode.y + tOff.dy;

  return {
    d: `M ${sx} ${sy} L ${ex} ${ey}`,
    midX: (sx + ex) / 2,
    midY: (sy + ey) / 2,
  };
}

interface AnimatedEdgeProps {
  edge: EdgeDef;
  fromNode: NodeDef;
  toNode: NodeDef;
  active: boolean;
  visited: boolean;
  accentColor: string;
  diagramId: string;
  labelScale?: number;
}

const AnimatedEdge: React.FC<AnimatedEdgeProps> = ({
  edge,
  fromNode,
  toNode,
  active,
  diagramId,
  labelScale = 1,
}) => {
  const { d, midX, midY } = computeEdgePath(fromNode, toNode, edge);
  const color = fromNode.color;
  const gradId = `flow-grad-${diagramId}-${edge.id}`;

  const labelX = edge.labelPos?.x ?? midX;
  const labelY = edge.labelPos?.y ?? midY;

  return (
    <g className="transition-all duration-300">
      <defs>
        <linearGradient id={gradId} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Continuous Flowing Energy Stream */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        // strokeDasharray="22 10"
        opacity={active ? 1 : 0.65}
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="32"
          to="0"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </path>

      {/* 2. Quantum Data Packets (Multiple) */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M -5,-4 L 5,0 L -5,4 Z"
          fill="white"
          opacity={active ? 1 : 0.55}
        >
          <animateMotion
            path={d}
            dur="1.8s"
            rotate="auto"
            repeatCount="indefinite"
            begin={`${i * 0.6}s`}
          />
        </path>
      ))}

      {edge.label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fontSize={10 * labelScale}
          fill={active ? "cyan" : "#b5b5b5"}
          fontFamily="'JetBrains Mono',monospace"
          fontWeight={active ? "700" : "500"}
          className="transition-all duration-300"
          style={{
            textShadow: active ? `0 0 10px ${color}` : 'none',
            letterSpacing: '0.05em'
          }}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
};

// ─── Generic Animated Workflow Diagram ────────────────────────────────────────
const WorkflowDiagram: React.FC<{
  config: WorkflowConfig;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  step: number;
  diagramId: string;
}> = ({ config, isPlaying: _isPlaying, step, diagramId }) => {
  const { width, height, nodes, edges, steps, groupBox, groupBoxes, accentColor } = config;
  const labelScale = config.labelScale ?? 1;

  const visitedEdgeIds = new Set(edges.map((e) => e.id));
  const activeEdgeId =
    step >= 0 && step < steps.length ? steps[step].edgeId : null;

  const visitedNodeIds = new Set(nodes.map((n) => n.id));

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div
      className="w-full relative rounded-2xl overflow-hidden border border-white/5 h-auto"
      style={{
        background: "linear-gradient(160deg, #08090D 0%, #0d0f18 100%)",
        // background: "linear-gradient(160deg, #08090D 0%, #6b7abd 100%)",
        fontFamily: "'JetBrains Mono','Fira Mono',monospace",
      }}
    >
      {/* Top bar */}
      {/* <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/5"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[11px] text-gray-400 tracking-wider">
            <span style={{ fontSize: `${11 * labelScale}px` }}>
              {config.title.toLowerCase().replace(/ /g, "-")}.workflow
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: isPlaying ? accentColor : "#555" }}
          />
          <span
            className="text-[10px] font-mono"
            style={{
              color: isPlaying ? accentColor : "accentColor",
              fontSize: `${10 * labelScale}px`,
            }}
          >
            {isPlaying ? "LIVE" : "PAUSED"}
          </span>
        </div>
      </div> */}

      {/* Diagram SVG */}
      <div className="w-full p-6 flex justify-center items-center h-full">
        <div className="w-full max-w-full">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: "block", height: "auto" }}
          >
            {/* (Markers are now defined per-edge) */}

            {/* Group box(es) */}
            {[...(groupBoxes ?? []), ...(groupBox ? [groupBox] : [])].map(
              (gb, i) => (
                <motion.g
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <rect
                    x={gb.x}
                    y={gb.y}
                    width={gb.w}
                    height={gb.h}
                    rx={14}
                    fill={`${gb.color}05`}
                    stroke={`${gb.color}30`}
                    strokeWidth={1.5}
                  />
                  <text
                    x={gb.x + 24}
                    y={gb.y + 28}
                    textAnchor="start"
                    fontSize={14 * labelScale}
                    fill={gb.color}
                    fontFamily="'JetBrains Mono',monospace"
                    fontWeight="700"
                    opacity={0.8}
                  >
                    {gb.label}
                  </text>
                </motion.g>
              ),
            )}

            {/* Edges */}
            {edges.map((edge) => {
              const fn = nodeMap[edge.from];
              const tn = nodeMap[edge.to];
              if (!fn || !tn) return null;
              return (
                <AnimatedEdge
                  key={edge.id}
                  edge={edge}
                  fromNode={fn}
                  toNode={tn}
                  active={edge.id === activeEdgeId}
                  visited={visitedEdgeIds.has(edge.id)}
                  accentColor={accentColor}
                  diagramId={diagramId}
                  labelScale={labelScale}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <WorkflowNode
                key={node.id}
                node={node}
                active={
                  activeEdgeId !== null &&
                  edges.some(
                    (e) =>
                      e.id === activeEdgeId &&
                      (e.from === node.id || e.to === node.id),
                  )
                }
                visited={visitedNodeIds.has(node.id) || step === -1}
                labelScale={labelScale}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SYSTEM ARCHITECTURE WORKFLOW
// Mermaid source translated into animated FE diagram.
// ═══════════════════════════════════════════════════════════════════════════════
export const SYSTEM_ARCHITECTURE_CONFIG: WorkflowConfig = {
  title: "System Architecture Workflow",
  subtitle: "system-architecture.workflow",
  accentColor: "#22D3EE",
  labelScale: 1.1,
  width: 1240,
  height: 540,
  nodes: [
    {
      id: "fe",
      label: "React / Vite\nSPA",
      x: 120,
      y: 130,
      w: 80,
      h: 60,
      shape: "icon",
      iconType: "frontend",
      color: "#60A5FA",
    },
    {
      id: "kp",
      label: "Keeper Bot",
      x: 120,
      y: 330,
      w: 100,
      h: 74,
      shape: "icon",
      iconType: "keeper",
      color: "#F472B6",
    },
    {
      id: "be",
      label: "NestJS\nSocket.IO + REST",
      x: 430,
      y: 170,
      w: 132,
      h: 76,
      shape: "icon",
      iconType: "backend",
      color: "#22D3EE",
      fill: "#22D3EE",
      processing: true,
    },
    {
      id: "wk",
      label: "Worker",
      x: 430,
      y: 370,
      w: 100,
      h: 62,
      shape: "icon",
      iconType: "worker",
      color: "#34D399",
    },
    {
      id: "sc",
      label: "carnot_engine · PDAs",
      x: 880,
      y: 80,
      w: 52,
      h: 52,
      shape: "icon",
      iconType: "solana",
      color: "#818CF8",
    },
    {
      id: "sp",
      label: "SP1 Prover",
      x: 760,
      y: 330,
      w: 86,
      h: 62,
      shape: "icon",
      iconType: "approver",
      color: "#FB923C",
    },
    {
      id: "pg",
      label: "PostgreSQL",
      x: 1090,
      y: 160,
      w: 82,
      h: 62,
      shape: "icon",
      iconType: "postgres",
      color: "#8bbbfa",
    },
    {
      id: "rd",
      label: "Redis",
      x: 1090,
      y: 270,
      w: 80,
      h: 60,
      shape: "icon",
      iconType: "redis",
      color: "#F87171",
    },
    {
      id: "ch",
      label: "ClickHouse",
      x: 1090,
      y: 370,
      w: 70,
      h: 72,
      shape: "icon",
      iconType: "clickhouse",
      color: "#FBBF24",
    },
    {
      id: "kf",
      label: "Kafka",
      x: 920,
      y: 280,
      w: 96,
      h: 58,
      shape: "rounded",
      color: "#EAB308",
      fill: "#EAB308",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "fe",
      to: "be",
      label: "REST | JWT Bearer",
      labelPos: { x: 295, y: 125 },
    },
    {
      id: "e2",
      from: "fe",
      to: "be",
      label: "Socket.IO | WSS key",
      labelPos: { x: 235, y: 205 },
      curved: true,
      cp: { x: 270, y: 195 },
    },
    {
      id: "e3",
      from: "kp",
      to: "be",
      label: "HTTP | X-API-KEY",
      labelPos: { x: 190, y: 250 },
    },
    {
      id: "e4",
      from: "kp",
      to: "be",
      label: "/internal/* | Bearer token",
      labelPos: { x: 320, y: 290 },
      curved: true,
      cp: { x: 250, y: 250 },
    },
    {
      id: "e5",
      from: "kp",
      to: "sc",
      label: "Anchor CPI | verify_and_settle",
      labelPos: { x: 270, y: 425 },
      curved: true,
      cp: { x: 570, y: 550 },
    },
    {
      id: "e6",
      from: "kp",
      to: "sp",
      label: "subprocess spawn",
      labelPos: { x: 330, y: 320 },
    },
    {
      id: "e7",
      from: "be",
      to: "sc",
      label: "Anchor CPI | admin/deposit ops",
      labelPos: { x: 600, y: 105 },
    },
    {
      id: "e8",
      from: "wk",
      to: "pg",
      label: "read/write",
      labelPos: { x: 880, y: 200 },
      curved: true,
      cp: { x: 760, y: 240 },
    },
    {
      id: "e9",
      from: "be",
      to: "pg",
      label: "read/write",
      labelPos: { x: 900, y: 152 },
    },
    {
      id: "e10",
      from: "be",
      to: "rd",
      label: "session/rate-limit",
      labelPos: { x: 610, y: 220 },
    },
    {
      id: "e11",
      from: "wk",
      to: "ch",
      label: "OHLC queries",
      labelPos: { x: 860, y: 385 },
    },
    {
      id: "e12",
      from: "be",
      to: "kf",
      label: "async events",
      labelPos: { x: 680, y: 210 },
    },
    {
      id: "e13",
      from: "wk",
      to: "kf",
      label: "batch pipeline",
      labelPos: { x: 680, y: 340 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "Frontend calls Backend API over REST with JWT bearer auth.",
    },
    {
      edgeId: "e2",
      desc: "Frontend also streams over Socket.IO using a WSS key.",
    },
    {
      edgeId: "e3",
      desc: "Keeper Bot calls Backend API with X-API-KEY for external bot routes.",
    },
    {
      edgeId: "e4",
      desc: "Keeper Bot accesses internal Backend API endpoints with a bearer token.",
    },
    {
      edgeId: "e5",
      desc: "Keeper Bot executes verify_and_settle against the Solana Program.",
    },
    {
      edgeId: "e6",
      desc: "Keeper Bot spawns the SP1 prover as a subprocess.",
    },
    {
      edgeId: "e7",
      desc: "Backend API performs admin and deposit Anchor CPI operations on Solana.",
    },
    {
      edgeId: "e8",
      desc: "Worker reads and writes settlement data in PostgreSQL.",
    },
    {
      edgeId: "e9",
      desc: "Backend API reads and writes application state in PostgreSQL.",
    },
    {
      edgeId: "e10",
      desc: "Backend API uses Redis for sessions and rate limiting.",
    },
    {
      edgeId: "e11",
      desc: "Worker queries OHLC data from ClickHouse.",
    },
    {
      edgeId: "e12",
      desc: "API publishes domain events to Kafka (streams, fan-out).",
    },
    {
      edgeId: "e13",
      desc: "Worker consumes Kafka for durable batch assembly triggers.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. VOLATILITY ENGINE — EGARCH(1,1) + Hawkes Process
// ═══════════════════════════════════════════════════════════════════════════════
export const VOLATILITY_ENGINE_CONFIG: WorkflowConfig = {
  title: "Volatility Engine",
  subtitle: "egarch-hawkes.workflow",
  accentColor: "#FB923C",
  labelScale: 1.2,
  width: 1020,
  height: 480,
  nodes: [
    {
      id: "ticks",
      label: "Price Ticks",
      x: 130,
      y: 240,
      w: 120,
      h: 54,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "egarch",
      label: "EGARCH(1,1)",
      x: 350,
      y: 140,
      w: 170,
      h: 62,
      shape: "rounded",
      color: "#FB923C",
      fill: "#FB923C",
      processing: true,
    },
    {
      id: "hawkes",
      label: "Hawkes Process",
      x: 350,
      y: 340,
      w: 170,
      h: 62,
      shape: "rounded",
      color: "#818CF8",
      fill: "#818CF8",
      processing: true,
    },
    {
      id: "sigma",
      label: "σ_t\nRealized Vol",
      x: 620,
      y: 140,
      w: 140,
      h: 56,
      shape: "rounded",
      color: "#FBBF24",
    },
    {
      id: "lambda",
      label: "λ_t\nJump Intensity",
      x: 620,
      y: 340,
      w: 148,
      h: 56,
      shape: "rounded",
      color: "#A78BFA",
    },
    {
      id: "out",
      label: "Pricing\nEngine",
      x: 800,
      y: 240,
      w: 130,
      h: 56,
      shape: "rounded",
      color: "#34D399",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "ticks",
      to: "egarch",
      label: "return series",
      labelPos: { x: 180, y: 182 },
    },
    {
      id: "e2",
      from: "ticks",
      to: "hawkes",
      label: "event times",
      labelPos: { x: 185, y: 305 },
    },
    {
      id: "e3",
      from: "egarch",
      to: "sigma",
      label: "vol estimate",
      labelPos: { x: 495, y: 125 },
    },
    {
      id: "e4",
      from: "sigma",
      to: "hawkes",
      label: "σ_t baseline",
      curved: true,
      cp: { x: 595, y: 245 },
      labelPos: { x: 650, y: 230 },
    },
    {
      id: "e5",
      from: "hawkes",
      to: "lambda",
      label: "intensity",
      labelPos: { x: 492, y: 360 },
    },
    {
      id: "e6",
      from: "sigma",
      to: "out",
      label: "σ_t",
      labelPos: { x: 720, y: 170 },
    },
    {
      id: "e7",
      from: "lambda",
      to: "out",
      label: "λ_t",
      labelPos: { x: 730, y: 305 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "5-second price return series drives the EGARCH(1,1) estimator continuously.",
    },
    {
      edgeId: "e3",
      desc: "EGARCH(1,1) outputs σ_t with asymmetric amplification — negative shocks produce larger vol spikes than equivalent positive moves.",
    },
    {
      edgeId: "e4",
      desc: "σ_t feeds into the Hawkes Process as the baseline intensity, linking vol state to jump timing.",
    },
    {
      edgeId: "e2",
      desc: "Tick event times self-excite the Hawkes Process — clusters of large moves elevate future jump intensity.",
    },
    {
      edgeId: "e5",
      desc: "Hawkes outputs λ_t: a time-varying jump intensity that spikes after price-move clusters and decays exponentially.",
    },
    {
      edgeId: "e6",
      desc: "σ_t is forwarded to the Pricing Engine as diffusion volatility.",
    },
    {
      edgeId: "e7",
      desc: "λ_t is forwarded to the Pricing Engine as Poisson jump intensity — both layers are structurally coupled.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PRICING ENGINE — Jump-Diffusion + Sobol QMC
// ═══════════════════════════════════════════════════════════════════════════════
export const PRICING_ENGINE_CONFIG: WorkflowConfig = {
  title: "Pricing Engine",
  subtitle: "jump-diffusion-sobol.workflow",
  accentColor: "#22D3EE",
  labelScale: 1.15,
  width: 1020,
  height: 480,
  nodes: [
    {
      id: "sig",
      label: "σ_t In",
      x: 80,
      y: 170,
      w: 90,
      h: 52,
      shape: "rounded",
      color: "#fffc40",
    },
    {
      id: "lam",
      label: "λ_t In",
      x: 80,
      y: 310,
      w: 90,
      h: 52,
      shape: "rounded",
      color: "#A78BFA",
    },
    {
      id: "jd",
      label: "Jump-Diffusion\nProcess",
      x: 300,
      y: 240,
      w: 190,
      h: 72,
      shape: "rounded",
      color: "#22D3EE",
      fill: "#22D3EE",
      processing: true,
    },
    {
      id: "sobol",
      label: "Sobol QMC\nSequences",
      x: 520,
      y: 140,
      w: 165,
      h: 60,
      shape: "rounded",
      color: "#F472B6",
    },
    {
      id: "paths",
      label: "N Price\nPaths",
      x: 520,
      y: 340,
      w: 140,
      h: 56,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "ptrue",
      label: "P_true\nEstimate",
      x: 690,
      y: 240,
      w: 140,
      h: 56,
      shape: "rounded",
      color: "#6EE7B7",
    },
    {
      id: "mult",
      label: "Fair Multiplier\n1 / P_true",
      x: 920,
      y: 240,
      w: 148,
      h: 58,
      shape: "rounded",
      color: "#34D399",
      fill: "#34D399",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "sig",
      to: "jd",
      label: "diffusion vol",
      labelPos: { x: 210, y: 190 },
    },
    {
      id: "e2",
      from: "lam",
      to: "jd",
      label: "jump intensity",
      labelPos: { x: 200, y: 305 },
    },
    {
      id: "e3",
      from: "jd",
      to: "sobol",
      label: "parametrize paths",
      labelPos: { x: 365, y: 176 },
    },
    {
      id: "e4",
      from: "sobol",
      to: "paths",
      label: "low-discrepancy draws",
      labelPos: { x: 608, y: 198 },
    },
    {
      id: "e5",
      from: "paths",
      to: "ptrue",
      label: "fraction in [L,U)",
      labelPos: { x: 672, y: 306 },
    },
    {
      id: "e6",
      from: "ptrue",
      to: "mult",
      label: "1 / P_true",
      labelPos: { x: 802, y: 230 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "σ_t from the EGARCH layer enters the Jump-Diffusion process as diffusion volatility.",
    },
    {
      edgeId: "e2",
      desc: "λ_t enters as the Poisson jump intensity — structurally consistent with the Hawkes vol engine.",
    },
    {
      edgeId: "e3",
      desc: "The process is parametrized to simulate N paths for each cell (band [L,U], window T).",
    },
    {
      edgeId: "e4",
      desc: "Paths are drawn using Quasi-Monte Carlo Sobol sequences — low-discrepancy fills the state space uniformly, giving 10-30× variance reduction.",
    },
    {
      edgeId: "e5",
      desc: "For each cell, count the fraction of paths where S_T ∈ [L,U) — this is the true win probability P_true.",
    },
    {
      edgeId: "e6",
      desc: "The fair multiplier is 1/P_true, then scaled by the 7% platform edge before commitment.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BARRIER CORRECTION — Kou Jump-Diffusion Extension
// ═══════════════════════════════════════════════════════════════════════════════
export const BARRIER_CORRECTION_CONFIG: WorkflowConfig = {
  title: "Barrier Correction",
  subtitle: "kou-extension.workflow",
  accentColor: "#818CF8",
  labelScale: 1.15,
  width: 1020,
  height: 480,
  nodes: [
    {
      id: "cell",
      label: "Near-Barrier\nCell",
      x: 100,
      y: 240,
      w: 135,
      h: 62,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "params",
      label: "σ_t · λ · η\nJump Params",
      x: 260,
      y: 130,
      w: 155,
      h: 60,
      shape: "rounded",
      color: "#FBBF24",
    },
    {
      id: "diffterm",
      label: "Diffusion\nBarrier Term",
      x: 530,
      y: 130,
      w: 162,
      h: 60,
      shape: "rounded",
      color: "#6EE7B7",
    },
    {
      id: "jumpterm",
      label: "Kou Jump\nCorrection Δ",
      x: 430,
      y: 330,
      w: 162,
      h: 60,
      shape: "rounded",
      color: "#818CF8",
      fill: "#818CF8",
      processing: true,
    },
    {
      id: "ptouch",
      label: "P_touch\nCombined",
      x: 640,
      y: 240,
      w: 145,
      h: 60,
      shape: "rounded",
      color: "#F472B6",
    },
    {
      id: "mult",
      label: "Adjusted\nMultiplier",
      x: 900,
      y: 240,
      w: 130,
      h: 60,
      shape: "rounded",
      color: "#34D399",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "cell",
      to: "params",
      label: "barrier coords",
      labelPos: { x: 110, y: 182 },
    },
    {
      id: "e2",
      from: "params",
      to: "diffterm",
      label: "σ²T term",
      labelPos: { x: 395, y: 112 },
    },
    {
      id: "e3",
      from: "params",
      to: "jumpterm",
      label: "λ, η₁, η₂",
      labelPos: { x: 410, y: 252 },
    },
    {
      id: "e4",
      from: "diffterm",
      to: "ptouch",
      label: "diffusion prob",
      labelPos: { x: 650, y: 182 },
    },
    {
      id: "e5",
      from: "jumpterm",
      to: "ptouch",
      label: "Δ_Kou",
      labelPos: { x: 566, y: 298 },
    },
    {
      id: "e6",
      from: "ptouch",
      to: "mult",
      label: "refined prob",
      labelPos: { x: 772, y: 228 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "A near-barrier cell is identified — standard diffusion estimates understate touch probability near band edges.",
    },
    {
      edgeId: "e2",
      desc: "The diffusion barrier term exp(-2(x-b)(y-b)/σ²T) is computed from barrier position and σ_t.",
    },
    {
      edgeId: "e3",
      desc: "Jump parameters λ (intensity), η₁ (upward), η₂ (downward) drive the Kou double-exponential correction.",
    },
    {
      edgeId: "e4",
      desc: "The diffusion term contributes the base barrier-touch probability under continuous price movement.",
    },
    {
      edgeId: "e5",
      desc: "Δ_Kou adds the jump-induced touch probability — collapses to 0 as λ→0, reducing cleanly to the standard bridge.",
    },
    {
      edgeId: "e6",
      desc: "P_touch = diffusion + Δ_Kou refines the near-barrier cell multiplier for accurate jump-aware pricing.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. QUOTER — Avellaneda-Stoikov + VPIN Adverse Selection Gate
// ═══════════════════════════════════════════════════════════════════════════════
export const QUOTER_CONFIG: WorkflowConfig = {
  title: "Avellaneda-Stoikov Quoter",
  subtitle: "as-vpin-quoter.workflow",
  accentColor: "#F472B6",
  labelScale: 1.15,
  width: 920,
  height: 500,
  nodes: [
    {
      id: "inputs",
      label: "σ_t + Inventory q",
      x: 110,
      y: 240,
      w: 164,
      h: 60,
      shape: "rounded",
      color: "#FBBF24",
    },
    {
      id: "as",
      label: "Avellaneda-Stoikov\nModel",
      x: 320,
      y: 140,
      w: 205,
      h: 68,
      shape: "rounded",
      color: "#F472B6",
      fill: "#F472B6",
      processing: true,
    },
    {
      id: "rd",
      label: "r + δ\nBase Quote",
      x: 620,
      y: 140,
      w: 130,
      h: 58,
      shape: "rounded",
      color: "#F472B6",
    },
    {
      id: "flow",
      label: "Order Flow\nData",
      x: 320,
      y: 380,
      w: 150,
      h: 58,
      shape: "rounded",
      color: "#6EE7B7",
    },
    {
      id: "vpin",
      label: "VPIN\nToxicity Gate",
      x: 620,
      y: 380,
      w: 150,
      h: 58,
      shape: "rounded",
      color: "#A78BFA",
    },
    {
      id: "quote",
      label: "Quoted\nMultiplier",
      x: 810,
      y: 260,
      w: 150,
      h: 62,
      shape: "rounded",
      color: "#34D399",
      fill: "#34D399",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "inputs",
      to: "as",
      label: "vol + inventory",
      labelPos: { x: 140, y: 185 },
    },
    {
      id: "e2",
      from: "as",
      to: "rd",
      label: "r, δ closed-form",
      labelPos: { x: 490, y: 128 },
    },
    {
      id: "e3",
      from: "flow",
      to: "vpin",
      label: "directional vol",
      labelPos: { x: 472, y: 400 },
    },
    {
      id: "e4",
      from: "rd",
      to: "quote",
      label: "base quote",
      labelPos: { x: 755, y: 192 },
    },
    {
      id: "e5",
      from: "vpin",
      to: "quote",
      label: "toxicity skew",
      labelPos: { x: 768, y: 330 },
    },
    {
      id: "e6",
      from: "inputs",
      to: "flow",
      label: "market context",
      labelPos: { x: 170, y: 328 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "σ_t and inventory state q enter the Avellaneda-Stoikov stochastic control model.",
    },
    {
      edgeId: "e2",
      desc: "AS outputs reservation price r = s - q·γ·σ²·(T-t) and optimal half-spread δ = γσ²(T-t) + (2/γ)ln(1+γ/κ).",
    },
    {
      edgeId: "e6",
      desc: "Market context feeds directional order flow data into the VPIN computation.",
    },
    {
      edgeId: "e3",
      desc: "VPIN (Volume-Synchronized Probability of Informed Trading) detects adverse selection regime from order flow imbalance.",
    },
    {
      edgeId: "e4",
      desc: "The base quote [r−δ, r+δ] is forwarded to the output stage.",
    },
    {
      edgeId: "e5",
      desc: "VPIN gate applies further skew against toxic flow direction before the multiplier is committed to the grid.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. RISK MANAGEMENT — EVT-Calibrated CVaR + GPD Pool Controls
// ═══════════════════════════════════════════════════════════════════════════════
export const RISK_MANAGEMENT_CONFIG: WorkflowConfig = {
  title: "Risk Management",
  subtitle: "evt-cvar-pool.workflow",
  accentColor: "#F87171",
  labelScale: 1.15,
  width: 980,
  height: 490,
  nodes: [
    {
      id: "positions",
      label: "Open\nPositions",
      x: 90,
      y: 245,
      w: 128,
      h: 60,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "losses",
      label: "Loss\nSimulation",
      x: 360,
      y: 245,
      w: 148,
      h: 62,
      shape: "rounded",
      color: "#F87171",
      fill: "#F87171",
      processing: true,
    },
    {
      id: "tail",
      label: "Tail Losses\n≥ threshold u",
      x: 540,
      y: 130,
      w: 172,
      h: 60,
      shape: "rounded",
      color: "#FBBF24",
    },
    {
      id: "gpd",
      label: "GPD Tail Fit\nF_u(x)",
      x: 540,
      y: 360,
      w: 162,
      h: 60,
      shape: "rounded",
      color: "#22D3EE",
      fill: "#22D3EE",
      processing: true,
    },
    {
      id: "cvar",
      label: "CVaR₀.₉₅",
      x: 730,
      y: 245,
      w: 138,
      h: 60,
      shape: "rounded",
      color: "#F87171",
      fill: "#F87171",
    },
    {
      id: "ok",
      label: "Normal\nOperation",
      x: 910,
      y: 130,
      w: 128,
      h: 58,
      shape: "rounded",
      color: "#37ffb6",
    },
    {
      id: "tighten",
      label: "Tighten Pool\nControls",
      x: 910,
      y: 360,
      w: 128,
      h: 60,
      shape: "rounded",
      color: "#FB923C",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "positions",
      to: "losses",
      label: "payout scenarios",
      labelPos: { x: 220, y: 230 },
    },
    {
      id: "e2",
      from: "losses",
      to: "tail",
      label: "outcomes ≥ u",
      labelPos: { x: 392, y: 180 },
    },
    {
      id: "e3",
      from: "losses",
      to: "gpd",
      label: "fit distribution",
      labelPos: { x: 382, y: 335 },
    },
    {
      id: "e4",
      from: "tail",
      to: "cvar",
      label: "VaR₀.₉₅ input",
      labelPos: { x: 582, y: 202 },
    },
    {
      id: "e5",
      from: "gpd",
      to: "cvar",
      label: "ξ, β params",
      labelPos: { x: 590, y: 290 },
    },
    {
      id: "e6",
      from: "cvar",
      to: "ok",
      label: "within budget",
      labelPos: { x: 890, y: 192 },
    },
    {
      id: "e7",
      from: "cvar",
      to: "tighten",
      label: "exceeds budget",
      labelPos: { x: 885, y: 305 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "All open positions are aggregated and simulated for pool-level loss outcomes under current σ_t and λ_t.",
    },
    {
      edgeId: "e2",
      desc: "Loss outcomes exceeding threshold u are extracted — the empirical tail of the pool loss distribution.",
    },
    {
      edgeId: "e3",
      desc: "A Generalized Pareto Distribution F_u(x) = 1-(1+ξx/β)^(-1/ξ) is fit to the tail via Peaks-over-Threshold.",
    },
    {
      edgeId: "e4",
      desc: "VaR₀.₉₅ from the tail sample initializes the closed-form CVaR computation.",
    },
    {
      edgeId: "e5",
      desc: "GPD shape ξ and scale β yield CVaR₀.₉₅ = (VaR₀.₉₅ + β − ξu) / (1 − ξ) — accurate in heavy-tailed regimes.",
    },
    {
      edgeId: "e6",
      desc: "If CVaR is within the risk budget, normal pool operation continues without intervention.",
    },
    {
      edgeId: "e7",
      desc: "If CVaR exceeds the budget, MAX_UTILIZATION_BPS and MAX_SINGLE_BET_EXPOSURE_BPS are tightened automatically.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ZK SETTLEMENT PROOF FLOW
// Minimal-label diagram translated from the mermaid SP1/Groth16 pipeline.
// ═══════════════════════════════════════════════════════════════════════════════
export const ZK_SETTLEMENT_PROOF_CONFIG: WorkflowConfig = {
  title: "ZK Settlement Proof Flow",
  subtitle: "zk-settlement-proof.workflow",
  accentColor: "#A78BFA",
  labelScale: 1.0,
  width: 1120,
  height: 580,
  groupBoxes: [
    { label: "Private Inputs", x: 40, y: 105, w: 240, h: 420, color: "#60A5FA" },
    {
      label: "SP1 Circuit (Rust guest)",
      x: 400,
      y: 60,
      w: 320,
      h: 420,
      color: "#F472B6",
    },
    { label: "Public Output", x: 800, y: 105, w: 240, h: 180, color: "#34D399" },
  ],
  nodes: [
    {
      id: "in_trades",
      label: "Trades\nsorted",
      x: 160,
      y: 200,
      w: 130,
      h: 48,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "in_commits",
      label: "Commitments\nKeccak",
      x: 160,
      y: 266,
      w: 150,
      h: 48,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "in_ohlc",
      label: "OHLC\n1s candles",
      x: 160,
      y: 332,
      w: 120,
      h: 48,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "in_pyth",
      label: "Pyth\ncheckpoints",
      x: 160,
      y: 398,
      w: 130,
      h: 48,
      shape: "rounded",
      color: "#60A5FA",
    },
    {
      id: "in_meta",
      label: "Metadata\nwindow + fees",
      x: 160,
      y: 464,
      w: 150,
      h: 48,
      shape: "rounded",
      color: "#60A5FA",
    },

    {
      id: "c_a",
      label: "A. Ordering\nsort + dedupe",
      x: 560,
      y: 150,
      w: 210,
      h: 56,
      shape: "rounded",
      color: "#F472B6",
      fill: "#F472B6",
      processing: true,
    },
    {
      id: "c_b",
      label: "B. Oracle\nOHLC vs Pyth",
      x: 560,
      y: 238,
      w: 200,
      h: 56,
      shape: "rounded",
      color: "#F472B6",
    },
    {
      id: "c_c",
      label: "C. Settlement\nwin + payout",
      x: 560,
      y: 326,
      w: 210,
      h: 56,
      shape: "rounded",
      color: "#F472B6",
    },
    {
      id: "c_d",
      label: "D. Finance\nfees + balances",
      x: 560,
      y: 414,
      w: 210,
      h: 56,
      shape: "rounded",
      color: "#F472B6",
    },

    {
      id: "out_hash",
      label: "public_outputs_hash\nSHA-256",
      x: 920,
      y: 206,
      w: 200,
      h: 58,
      shape: "rounded",
      color: "#34D399",
      fill: "#34D399",
    },
    {
      id: "groth",
      label: "Groth16\nproof",
      x: 950,
      y: 400,
      w: 52,
      h: 52,
      shape: "network",
      color: "#A78BFA",
    },
  ],
  edges: [
    {
      id: "e1",
      from: "in_trades",
      to: "c_a",
      label: "trades[]",
      labelPos: { x: 336, y: 160 },
    },
    {
      id: "e2",
      from: "in_commits",
      to: "c_a",
      label: "trade hashes",
      labelPos: { x: 330, y: 227 },
      curved: true,
      cp: { x: 330, y: 260 },
    },
    { id: "e3", from: "in_ohlc", to: "c_b", label: "ohlc[]", labelPos: { x: 336, y: 310 } },
    {
      id: "e4",
      from: "in_pyth",
      to: "c_b",
      label: "checkpoints",
      labelPos: { x: 332, y: 380 },
      curved: true,
      cp: { x: 330, y: 360 },
    },
    {
      id: "e5",
      from: "in_meta",
      to: "c_d",
      label: "window + fee_bps",
      labelPos: { x: 346, y: 480 },
      curved: true,
      cp: { x: 350, y: 472 },
    },
    { id: "e6", from: "c_a", to: "c_b", label: "ordered", labelPos: { x: 600, y: 198 } },
    {
      id: "e7",
      from: "c_b",
      to: "c_c",
      label: "validated prices",
      labelPos: { x: 630, y: 285 },
    },
    {
      id: "e8",
      from: "c_c",
      to: "c_d",
      label: "wins/losses",
      labelPos: { x: 620, y: 376 },
    },
    {
      id: "e9",
      from: "c_d",
      to: "out_hash",
      label: "preimage -> hash",
      labelPos: { x: 810, y: 362 },
      curved: true,
      cp: { x: 700, y: 400 },
    },
    {
      id: "e10",
      from: "out_hash",
      to: "groth",
      label: "SP1 wrap",
      labelPos: { x: 978, y: 326 },
    },
  ],
  steps: [
    { edgeId: "e1", desc: "Backend Settlement service streams sorted trades into the SP1 circuit input." },
    { edgeId: "e2", desc: "Per-trade commitments are loaded and matched against the incoming trade rows." },
    { edgeId: "e6", desc: "Stage A enforces deterministic ordering: sorted pubkeys, ascending trade IDs, and no duplicates." },
    { edgeId: "e3", desc: "OHLC candles are passed into Stage B for chronology and consistency checks." },
    { edgeId: "e4", desc: "Pyth checkpoints are cross-checked against OHLC bounds and window coverage." },
    { edgeId: "e7", desc: "Stage C computes win/loss, validates multiplier bounds, and derives gross payouts." },
    { edgeId: "e5", desc: "Batch metadata and fee parameters are injected into Stage D finance accounting." },
    { edgeId: "e8", desc: "Stage D enforces pool-balance transition, keeper fee logic, protocol fee rules, and winner/loser totals." },
    { edgeId: "e9", desc: "Circuit outputs are collapsed into one public SHA-256 commitment hash." },
    { edgeId: "e10", desc: "SP1 wraps execution into a Groth16 proof for on-chain verify_and_settle verification." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 12. FULL SYSTEM OVERVIEW
// Translated from overall.md mermaid diagram — shows User, Pyth, Backend (5
// NestJS services), Keeper pipeline, and Solana Program with internal flows.
// ═══════════════════════════════════════════════════════════════════════════════
export const FULL_SYSTEM_OVERVIEW_CONFIG: WorkflowConfig = {
  title: "Full System Overview",
  subtitle: "full-system-overview.workflow",
  accentColor: "#22D3EE",
  labelScale: 1.0,
  width: 1000,
  height: 600,
  groupBoxes: [
    { label: "Backend · NestJS", x: 215, y: 35, w: 520, h: 480, color: "#22D3EE" },
    { label: "Keeper", x: 760, y: 35, w: 200, h: 480, color: "#F472B6" },
  ],
  nodes: [
    { id: "user", label: "User", x: 80, y: 90, w: 52, h: 52, shape: "circle", color: "#60A5FA", icon: "👤" },
    { id: "pyth", label: "Pyth Oracle", x: 140, y: 310, w: 52, h: 52, shape: "network", color: "#A78BFA" },
    { id: "program", label: "carnot_engine", x: 80, y: 470, w: 52, h: 52, shape: "network", color: "#818CF8" },
    // Backend services
    { id: "b_price", label: "Price", x: 300, y: 200, w: 120, h: 48, shape: "rounded", color: "#FBBF24" },
    { id: "b_orders", label: "Orders", x: 572, y: 140, w: 120, h: 48, shape: "rounded", color: "#22D3EE", processing: true },
    { id: "b_settle", label: "Settlement", x: 340, y: 290, w: 130, h: 48, shape: "rounded", color: "#34D399" },
    { id: "b_risk", label: "Risk", x: 578, y: 300, w: 100, h: 48, shape: "rounded", color: "#F87171" },
    { id: "b_pay", label: "Payments", x: 365, y: 400, w: 120, h: 48, shape: "rounded", color: "#F6AD55" },
    // Keeper pipeline
    { id: "k_watch", label: "Watcher", x: 862, y: 132, w: 120, h: 48, shape: "rounded", color: "#F472B6" },
    { id: "k_prove", label: "Prover", x: 862, y: 248, w: 120, h: 48, shape: "rounded", color: "#FB923C" },
    { id: "k_submit", label: "Submitter", x: 862, y: 364, w: 130, h: 48, shape: "rounded", color: "#6EE7B7" },
  ],
  edges: [
    // External entry
    { id: "e1", from: "user", to: "b_orders", label: "REST / WS", labelPos: { x: 316, y: 99 } },
    { id: "e2", from: "pyth", to: "b_price", label: "price feed", labelPos: { x: 182, y: 246 } },
    // Internal Backend pipeline
    { id: "e3", from: "b_price", to: "b_orders", label: "ticks", labelPos: { x: 436, y: 160 } },
    { id: "e4", from: "b_orders", to: "b_settle", label: "settled", labelPos: { x: 502, y: 214 } },
    { id: "e5", from: "b_settle", to: "b_risk", label: "CVaR", labelPos: { x: 466, y: 313 } },
    // Settlement → Keeper
    { id: "e6", from: "b_settle", to: "k_watch", label: "batches", labelPos: { x: 644, y: 202 }, curved: true, cp: { x: 672, y: 215 } },
    // Keeper pipeline
    { id: "e7", from: "k_watch", to: "k_prove" },
    { id: "e8", from: "k_prove", to: "k_submit" },
    // Keeper → Settlement confirm (dashed back-edge)
    { id: "e9", from: "k_submit", to: "b_settle", label: "confirm", dashed: true, curved: true, cp: { x: 566, y: 442 }, labelPos: { x: 666, y: 421 } },
    // Keeper → Solana Program
    { id: "e10", from: "k_submit", to: "program", label: "ZK proof", curved: true, cp: { x: 500, y: 518 }, labelPos: { x: 533, y: 488 } },
    // Payments → Solana Program
    { id: "e11", from: "b_pay", to: "program", label: "margin ops", curved: true, cp: { x: 232, y: 410 }, labelPos: { x: 243, y: 436 } },
    // Solana Program → User (dashed on-chain state)
    { id: "e12", from: "program", to: "user", label: "vault state", dashed: true, curved: true, cp: { x: 44, y: 250 }, labelPos: { x: 108, y: 190 } },
  ],
  steps: [
    { edgeId: "e1", desc: "User places orders and streams data via REST endpoints and Socket.IO WebSocket." },
    { edgeId: "e2", desc: "Pyth Oracle delivers real-time price checkpoints to the Price service." },
    { edgeId: "e3", desc: "Price service fans out 5-second OHLC ticks to Orders for WIN/LOSS evaluation (hot path)." },
    { edgeId: "e4", desc: "Orders service writes settled positions to Settlement for batch assembly (cold path)." },
    { edgeId: "e5", desc: "Settlement runs a CVaR 95 check through the Risk service before committing the batch." },
    { edgeId: "e6", desc: "Settlement forwards pending batch metadata and Merkle winner proofs to the Keeper Watcher." },
    { edgeId: "e7", desc: "Watcher polls closed batch windows, emits a BatchTriggerSignal, and starts the Prover." },
    { edgeId: "e8", desc: "Prover runs the SP1 binary (Rust) to generate a Groth16 ZK proof, then hands off to Submitter." },
    { edgeId: "e9", desc: "Submitter confirms the settled batch back to the Settlement service after on-chain finality." },
    { edgeId: "e10", desc: "Submitter broadcasts the verify_and_settle ZK proof transaction to the Solana Program." },
    { edgeId: "e11", desc: "Payments service locks and unlocks trader margin directly on the Solana Program (deposit/withdraw)." },
    { edgeId: "e12", desc: "Solana Program emits on-chain vault state to users — PDAs, nullifier receipts, and payout proofs." },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// 13. PRICING PIPELINE — 5-Layer end-to-end flow
// Input:  Binance Futures aggTrade stream
// Output: Signed Cell Grid (fortressSpreadBps per cell, emitted every 250 ms)
// ═══════════════════════════════════════════════════════════════════════════════
export const PRICING_PIPELINE_CONFIG: WorkflowConfig = {
  title: "Pricing Pipeline",
  subtitle: "5-layer-pricing-pipeline.workflow",
  accentColor: "#FBBF24",
  labelScale: 1.2,
  width: 1380,
  height: 870,
  groupBoxes: [
    { label: "L1 · Volatility Engine",  x: 148, y: 90,  w: 290, h: 520, color: "#FB923C" },
    { label: "L2 · Reward Surface",     x: 488, y: 70,  w: 272, h: 350, color: "#FBBF24" },
    { label: "L3 · Kou Barrier",        x: 488, y: 455, w: 272, h: 225, color: "#6EE7B7" },
    { label: "L4 · AS Quoter",          x: 818, y: 70,  w: 296, h: 650, color: "#34D399" },
    { label: "L5 · CVaR Control",       x: 1164, y: 90, w: 206, h: 440, color: "#F87171" },
  ],
  nodes: [
    // ── Input ──────────────────────────────────────────────────────────────
    {
      id: "feed",
      label: "Feed\naggTrade",
      x: 72, y: 370, w: 58, h: 58,
      shape: "circle", color: "#60A5FA", icon: "📡",
    },

    // ── L1: Volatility Engine ──────────────────────────────────────────────
    {
      id: "n_sigma",
      label: "σ_t\nEGARCH(1,1)",
      x: 293, y: 205, w: 175, h: 56,
      shape: "rounded", color: "#FB923C", processing: true,
    },
    {
      id: "n_lambda",
      label: "λ_t\nHawkes",
      x: 293, y: 370, w: 175, h: 56,
      shape: "rounded", color: "#818CF8",
    },
    {
      id: "n_vpin",
      label: "VPIN\nflow toxicity",
      x: 293, y: 535, w: 175, h: 56,
      shape: "rounded", color: "#A78BFA",
    },

    // ── L2: Polynomial Reward Surface ─────────────────────────────────────
    {
      id: "n_volscale",
      label: "Vol Scale\ndyAdj",
      x: 624, y: 158, w: 165, h: 52,
      shape: "rounded", color: "#FBBF24",
    },
    {
      id: "n_poly",
      label: "Polynomial\nmodel(dx, dyAdj)",
      x: 624, y: 264, w: 175, h: 52,
      shape: "rounded", color: "#FBBF24", processing: true,
    },
    {
      id: "n_fairrate",
      label: "Fair Rate",
      x: 624, y: 378, w: 140, h: 52,
      shape: "rounded", color: "#FBBF24",
    },

    // ── L3: Kou Barrier Correction ─────────────────────────────────────────
    {
      id: "n_kou",
      label: "Kou Barrier\np=0.5  η₁/η₂",
      x: 624, y: 535, w: 175, h: 52,
      shape: "rounded", color: "#6EE7B7", processing: true,
    },
    {
      id: "n_nearfar",
      label: "Near/Far adj\nΔ applied",
      x: 624, y: 635, w: 165, h: 52,
      shape: "rounded", color: "#6EE7B7",
    },

    // ── L4: Avellaneda-Stoikov Quoter ──────────────────────────────────────
    {
      id: "n_volprem",
      label: "Vol Premium\n35 bps",
      x: 966, y: 158, w: 170, h: 52,
      shape: "rounded", color: "#34D399",
    },
    {
      id: "n_invprem",
      label: "Inv Premium\n45 bps",
      x: 966, y: 278, w: 170, h: 52,
      shape: "rounded", color: "#34D399",
    },
    {
      id: "n_vpinmult",
      label: "VPIN Mult\n×1.25 / ×1.10 / ×1.0",
      x: 966, y: 383, w: 200, h: 52,
      shape: "rounded", color: "#34D399",
    },
    {
      id: "n_regime",
      label: "Regime\nLOW / NORM / HIGH",
      x: 966, y: 482, w: 200, h: 52,
      shape: "rounded", color: "#34D399",
    },
    {
      id: "n_clamp",
      label: "Clamp [60–350]\nfortressSpreadBps",
      x: 966, y: 574, w: 200, h: 52,
      shape: "rounded", color: "#34D399", fill: "#34D399", processing: true,
    },

    // ── Output ─────────────────────────────────────────────────────────────
    {
      id: "n_gridout",
      label: "Grid Output\n250 ms emit",
      x: 966, y: 682, w: 180, h: 52,
      shape: "rounded", color: "#22D3EE", fill: "#22D3EE",
    },
    {
      id: "n_output",
      label: "OUTPUT\nSigned cell grid\n→ on-chain quoter",
      x: 620, y: 768, w: 440, h: 62,
      shape: "rect", color: "#22D3EE", fill: "#22D3EE",
    },

    // ── L5: CVaR Pool Control ──────────────────────────────────────────────
    {
      id: "n_snap",
      label: "Liability\n10 s snapshot",
      x: 1267, y: 200, w: 158, h: 52,
      shape: "rounded", color: "#F87171",
    },
    {
      id: "n_cvar",
      label: "CVaR₉₅\n+EVT ×1.2",
      x: 1267, y: 328, w: 155, h: 52,
      shape: "rounded", color: "#F87171", processing: true,
    },
    {
      id: "n_budget",
      label: "Budget flag\n>8% liability",
      x: 1267, y: 448, w: 165, h: 52,
      shape: "rounded", color: "#F87171",
    },
  ],
  edges: [
    // ── Feed → L1 ──────────────────────────────────────────────────────────
    { id: "e1", from: "feed", to: "n_sigma", label: "ticks", labelPos: { x: 140, y: 280 } },
    { id: "e2", from: "feed", to: "n_lambda", label: "ticks", curved: true, cp: { x: 145, y: 437 }, labelPos: { x: 160, y: 402 } },
    { id: "e3", from: "feed", to: "n_vpin", label: "ticks", curved: true, cp: { x: 145, y: 498 }, labelPos: { x: 175, y: 478 } },

    // ── L1 → L2 ────────────────────────────────────────────────────────────
    { id: "e4", from: "n_sigma", to: "n_volscale", label: "σ_t", labelPos: { x: 454, y: 210 } },

    // ── L2 internal ────────────────────────────────────────────────────────
    { id: "e5", from: "n_volscale", to: "n_poly", label: "dyAdj", labelPos: { x: 590, y: 212 } },
    { id: "e6", from: "n_poly", to: "n_fairrate", label: "×σ_ratio", labelPos: { x: 580, y: 316 } },

    // ── L1 → L3 ────────────────────────────────────────────────────────────
    { id: "e7", from: "n_sigma", to: "n_kou", label: "σ_t", curved: true, cp: { x: 465, y: 500 }, labelPos: { x: 408, y: 350 } },
    { id: "e8", from: "n_lambda", to: "n_kou", label: "λ_t", labelPos: { x: 405, y: 472 }, curved: true, cp: { x: 365, y: 510 } },

    // ── L2 → L3 ────────────────────────────────────────────────────────────
    { id: "e9", from: "n_fairrate", to: "n_kou", label: "fair_rate", labelPos: { x: 678, y: 441 } },

    // ── L3 internal ────────────────────────────────────────────────────────
    { id: "e10", from: "n_kou", to: "n_nearfar", label: "P(touch)", labelPos: { x: 670, y: 592 } },

    // ── L1 → L4 (long arcs above / below group boxes) ─────────────────────
    { id: "e11", from: "n_sigma", to: "n_volprem", label: "σ_t", curved: true, cp: { x: 630, y: 66 }, labelPos: { x: 720, y: 95 } },
    { id: "e12", from: "n_vpin", to: "n_vpinmult", label: "VPIN", curved: true, cp: { x: 630, y: 670 }, labelPos: { x: 460, y: 580 } },

    // ── L3 → L4 ────────────────────────────────────────────────────────────
    { id: "e13", from: "n_nearfar", to: "n_clamp", label: "adj rate", labelPos: { x: 798, y: 590 } },

    // ── L4 internals → Clamp ──────────────────────────────────────────────
    { id: "e14", from: "n_volprem", to: "n_clamp", curved: true, cp: { x: 698, y: 398 } },
    { id: "e15", from: "n_invprem", to: "n_clamp" },
    { id: "e16", from: "n_vpinmult", to: "n_clamp" },
    { id: "e17", from: "n_regime", to: "n_clamp" },
    { id: "e18", from: "n_clamp", to: "n_gridout" },

    // ── L5 internal ────────────────────────────────────────────────────────
    { id: "e19", from: "n_snap", to: "n_cvar" },
    { id: "e20", from: "n_cvar", to: "n_budget" },

    // ── L5 → L4: CVaR feedback (dashed) ───────────────────────────────────
    {
      id: "e21",
      from: "n_budget", to: "n_invprem",
      label: "utilization",
      dashed: true, curved: true,
      cp: { x: 1200, y: 534 }, labelPos: { x: 1172, y: 502 },
    },

    // ── Grid Output → final output terminal ───────────────────────────────
    { id: "e23", from: "n_gridout", to: "n_output", label: "emits", labelPos: { x: 855, y: 728 } },

    // ── Output → Feed: 250ms cycle feedback (dashed, arcs below output) ───
    {
      id: "e22",
      from: "n_gridout", to: "feed",
      label: "250ms cycle",
      dashed: true, curved: true,
      cp: { x: 70, y: 754 }, labelPos: { x: 302, y: 690 },
    },
  ],
  steps: [
    {
      edgeId: "e1",
      desc: "Binance Futures aggTrade ticks drive EGARCH(1,1) — negative shocks produce asymmetrically larger σ_t (leverage effect, γ=−0.06, α=0.12, β=0.85).",
    },
    {
      edgeId: "e2",
      desc: "Tick arrival times self-excite the Hawkes Process (μ=1.0, α=0.3, β=3.0) — clusters of rapid trades elevate λ_t, the live jump intensity.",
    },
    {
      edgeId: "e3",
      desc: "VPIN partitions volume into buy/sell buckets to detect order-flow toxicity; VPIN score rises when informed directional flow dominates.",
    },
    {
      edgeId: "e4",
      desc: "σ_ratio = σ_t / σ_baseline enters L2. Vol Scale computes dyAdj = dy / σ_ratio (clamped 0.2×–4×) — normalises grid coordinates for the polynomial.",
    },
    {
      edgeId: "e5",
      desc: "The 10-param polynomial model(dx, dyAdj) maps vol-adjusted coordinates to a raw fair payout rate, calibrated offline on historical tick data.",
    },
    {
      edgeId: "e6",
      desc: "fair_rate = model(dx, dyAdj) × σ_ratio — un-scaling restores the rate to the current vol regime.",
    },
    {
      edgeId: "e7",
      desc: "σ_t feeds into the Kou Barrier circuit so near-barrier touch probability scales with realised vol — plain diffusion understates touch near band edges.",
    },
    {
      edgeId: "e8",
      desc: "λ_t enters the Kou double-exponential model (p=0.5, η₁=7000, η₂=5600) — higher jump intensity raises P(touch) directly.",
    },
    {
      edgeId: "e9",
      desc: "fair_rate from L2 is the pre-correction rate; Δ_Kou is applied on top.",
    },
    {
      edgeId: "e10",
      desc: "Near/Far rule: cells with dy < 2 → rate ÷ (1 + P×0.10); cells with dy ≥ 2 → rate × (1 + P×0.18). Near-barrier cells get a tighter spread.",
    },
    {
      edgeId: "e11",
      desc: "σ_t also arcs directly into L4 — vol premium = max(σ_ratio − 1, 0) × 35 bps. Zero at or below baseline volatility, rising linearly above it.",
    },
    {
      edgeId: "e12",
      desc: "VPIN score sets the L4 multiplier: >0.8 → ×1.25 (toxic flow), >0.5 → ×1.10 (elevated), else ×1.0. Reacts to informed order flow before vol spikes.",
    },
    {
      edgeId: "e13",
      desc: "The Kou-corrected rate arrives at Clamp as the primary spread input from L3.",
    },
    {
      edgeId: "e15",
      desc: "Vol premium, inventory premium (CVaR-adjusted), VPIN multiplier, and regime tilt all converge at the Clamp node.",
    },
    {
      edgeId: "e18",
      desc: "fortressSpreadBps = clamp(raw, 60, 350). The signed cell grid with per-cell spread is emitted every 250 ms.",
    },
    {
      edgeId: "e19",
      desc: "L5 takes a liability snapshot every 10 s and maintains a rolling 200-sample ΔP&L history for CVaR estimation.",
    },
    {
      edgeId: "e20",
      desc: "CVaR₉₅ is computed empirically over the ΔP&L distribution with an EVT fat-tail ×1.2 correction for extreme regimes.",
    },
    {
      edgeId: "e21",
      desc: "If CVaR > 8% of total liability, the budget flag fires — inventory premium tightens, widening the spread and reducing pool exposure via L4.",
    },
    {
      edgeId: "e23",
      desc: "OUTPUT: a signed cell grid — one fortressSpreadBps value per (dx, dy) cell — is emitted to the on-chain quoter every 250 ms. This is the final priced grid the Carnot smart contract uses to determine payout multipliers for each price band.",
    },
    {
      edgeId: "e22",
      desc: "The signed cell grid closes the 250 ms feedback cycle — σ_t, λ_t, and VPIN continue updating continuously so the next emission already reflects any new market regime.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Wrapper with local play state
// ═══════════════════════════════════════════════════════════════════════════════
export const WorkflowPlayer: React.FC<{
  config: WorkflowConfig;
  diagramId: string;
}> = ({ config, diagramId }) => {
  const [step, setStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setStep((p) => (p >= config.steps.length - 1 ? -1 : p + 1));
    }, 1800);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, config.steps.length]);

  return (
    <WorkflowDiagram
      config={config}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        setStep(-1);
      }}
      step={step}
      diagramId={diagramId}
    />
  );
};
