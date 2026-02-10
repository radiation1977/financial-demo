/** Zustand store: swarm nodes, topology, plugins. */

import { create } from 'zustand';
import type { DashboardNode, PluginEntry } from '../api/types';

interface AuditEvent {
  timestamp: string;
  event_type: string;
  details: unknown;
}

interface SwarmState {
  connected: boolean;
  nodes: Map<string, DashboardNode>;
  plugins: Map<string, PluginEntry>;
  auditLog: AuditEvent[];
  nodeCount: number;
  liveNodeCount: number;

  // Actions
  setConnected: (v: boolean) => void;
  setNodes: (nodes: DashboardNode[]) => void;
  upsertNode: (node: DashboardNode) => void;
  removeNode: (id: string) => void;
  setPlugins: (plugins: PluginEntry[]) => void;
  upsertPlugin: (plugin: PluginEntry) => void;
  removePlugin: (id: string) => void;
  addAuditEvent: (event: AuditEvent) => void;
}

const MAX_AUDIT_LOG = 200;

export const useSwarmStore = create<SwarmState>((set, get) => ({
  connected: false,
  nodes: new Map(),
  plugins: new Map(),
  auditLog: [],
  nodeCount: 0,
  liveNodeCount: 0,

  setConnected: (v) => set({ connected: v }),

  setNodes: (nodes) => {
    const map = new Map<string, DashboardNode>();
    for (const n of nodes) map.set(n.id, n);
    set({
      nodes: map,
      nodeCount: map.size,
      liveNodeCount: [...map.values()].filter((n) => n.status === 'alive').length,
    });
  },

  upsertNode: (node) => {
    const nodes = new Map(get().nodes);
    nodes.set(node.id, node);
    set({
      nodes,
      nodeCount: nodes.size,
      liveNodeCount: [...nodes.values()].filter((n) => n.status === 'alive').length,
    });
  },

  removeNode: (id) => {
    const nodes = new Map(get().nodes);
    const node = nodes.get(id);
    if (node) {
      nodes.set(id, { ...node, status: 'dead' });
    }
    set({
      nodes,
      liveNodeCount: [...nodes.values()].filter((n) => n.status === 'alive').length,
    });
  },

  setPlugins: (plugins) => {
    const map = new Map<string, PluginEntry>();
    for (const p of plugins) map.set(p.id, p);
    set({ plugins: map });
  },

  upsertPlugin: (plugin) => {
    const plugins = new Map(get().plugins);
    plugins.set(plugin.id, plugin);
    set({ plugins });
  },

  removePlugin: (id) => {
    const plugins = new Map(get().plugins);
    plugins.delete(id);
    set({ plugins });
  },

  addAuditEvent: (event) => {
    const log = [event, ...get().auditLog].slice(0, MAX_AUDIT_LOG);
    set({ auditLog: log });
  },
}));
