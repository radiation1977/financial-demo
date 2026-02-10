/** REST client for swarm API endpoints. */

import type {
  ChaosStatus,
  DecompositionResult,
  ChannelEntry,
  PluginEntry,
} from './types';

const BASE = '/api/v1';

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`${resp.status} ${resp.statusText}: ${text}`);
  }
  return resp.json();
}

// --- Data Channels ---

export async function listChannels(): Promise<{ channels: ChannelEntry[] }> {
  return fetchJSON(`${BASE}/plugin-data/channels`);
}

export async function getChannel(name: string): Promise<ChannelEntry> {
  return fetchJSON(`${BASE}/plugin-data/channel/${encodeURIComponent(name)}`);
}

export async function queryChannel(
  name: string,
  query: Record<string, unknown>,
): Promise<{ result: unknown }> {
  return fetchJSON(`${BASE}/plugin-data/channel/${encodeURIComponent(name)}/query`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// --- Decomposition ---

export async function decompose(
  channel: string,
  axis: string,
  filter?: string,
  depth?: number,
): Promise<DecompositionResult> {
  const q: Record<string, unknown> = { axis };
  if (filter) q.filter = filter;
  if (depth) q.depth = depth;
  const resp = await queryChannel(channel, q);
  return resp.result as DecompositionResult;
}

// --- Plugins ---

export async function listPlugins(): Promise<PluginEntry[]> {
  const resp = await fetchJSON<{ plugins: PluginEntry[] }>(`${BASE}/plugins`);
  return resp.plugins;
}

export async function getPlugin(id: string): Promise<PluginEntry> {
  return fetchJSON(`${BASE}/plugins/${encodeURIComponent(id)}`);
}

// --- Chaos ---

export async function chaosKill(
  count: number = 1,
  nodeIds?: string[],
): Promise<unknown> {
  return fetchJSON(`${BASE}/chaos/kill`, {
    method: 'POST',
    body: JSON.stringify({ count, node_ids: nodeIds ?? [] }),
  });
}

export async function chaosPartition(
  partitionId: string,
  nodeIds: string[],
): Promise<unknown> {
  return fetchJSON(`${BASE}/chaos/partition`, {
    method: 'POST',
    body: JSON.stringify({ partition_id: partitionId, node_ids: nodeIds }),
  });
}

export async function chaosCascade(
  count: number = 5,
  delayMs: number = 2000,
): Promise<unknown> {
  return fetchJSON(`${BASE}/chaos/cascade`, {
    method: 'POST',
    body: JSON.stringify({ count, delay_ms: delayMs }),
  });
}

export async function chaosRejoin(): Promise<unknown> {
  return fetchJSON(`${BASE}/chaos/rejoin`, { method: 'POST' });
}

export async function chaosStatus(): Promise<ChaosStatus> {
  return fetchJSON(`${BASE}/chaos/status`);
}
