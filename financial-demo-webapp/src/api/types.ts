/** API response types matching the Rust/Python backend. */

// --- WebSocket Messages ---

export type DashboardMessageType =
  | 'full_state'
  | 'node_update'
  | 'node_died'
  | 'node_joined'
  | 'channel_update'
  | 'workflow_update'
  | 'audit_event'
  | 'plugin_registered'
  | 'plugin_died'
  | 'heartbeat';

export interface DashboardMessage {
  type: DashboardMessageType;
  data: unknown;
}

export interface FullStateData {
  nodes: DashboardNode[];
  channels: ChannelEntry[];
  plugins: PluginEntry[];
}

export interface DashboardNode {
  id: string;
  status: 'alive' | 'suspect' | 'dead';
  traits: string[];
  health: number;
  last_seen: number;
  addr: string;
}

export interface ChannelEntry {
  channel: string;
  plugin_id: string;
  plugin_traits: string[];
  payload: unknown;
  updated_at: number;
}

export interface PluginEntry {
  id: string;
  name: string;
  version: string;
  state: string;
  traits: string[];
}

// --- Cube Face Data ---

export interface CubeFaceData {
  channel: string;
  label: string;
  payload: unknown;
  updatedAt: number;
}

// --- Decomposition ---

export interface DecompositionNode {
  key: string;
  label: string;
  market_value: number;
  pnl: number;
  position_count: number;
  drillable: boolean;
}

export interface DecompositionResult {
  axis: string;
  children?: DecompositionNode[];
  filter?: string;
  positions?: unknown[];
  total_market_value?: number;
  error?: string;
}

// --- Chaos ---

export interface ChaosStatus {
  killed_nodes: string[];
  killed_count: number;
  partitions: { partition_id: string; node_count: number }[];
  cascade_active: boolean;
  event_log: { timestamp: string; event_type: string; details: unknown }[];
}

// --- Portfolio ---

export interface PortfolioSnapshot {
  nav: number;
  tick: number;
  total_positions: number;
  strategies: StrategySnapshot[];
  leverage?: number;
}

export interface StrategySnapshot {
  code: string;
  positions: unknown[];
  market_value: number;
  pnl: number;
}

// --- Greeks ---

export interface GreeksData {
  aggregate: { delta: number; gamma: number; vega: number; theta: number; rho: number };
  positions: unknown[];
  option_count: number;
}

// --- VaR ---

export interface VaRData {
  horizons: Record<string, Record<string, { var: number; cvar: number }>>;
  component_var: Record<string, number>;
  simulations: number;
}

// --- Compliance ---

export interface ComplianceData {
  status: 'compliant' | 'warning' | 'breach';
  violation_count: number;
  warning_count: number;
  violations: unknown[];
  warnings: unknown[];
}
