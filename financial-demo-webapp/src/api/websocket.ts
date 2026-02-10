/** WebSocket client for the /ws/dashboard endpoint. */

import type { DashboardMessage, FullStateData, ChannelEntry } from './types';
import { useSwarmStore } from '../store/swarm';
import { useCubeStore } from '../store/cubes';

const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_DELAY_MS = 30000;

let ws: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function connectDashboard(baseUrl?: string): void {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = baseUrl || `${protocol}//${window.location.host}`;
  const url = `${host}/ws/dashboard`;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('[ws] connected');
    reconnectAttempt = 0;
    useSwarmStore.getState().setConnected(true);
  };

  ws.onmessage = (event) => {
    try {
      const msg: DashboardMessage = JSON.parse(event.data);
      handleMessage(msg);
    } catch (err) {
      console.warn('[ws] invalid message:', err);
    }
  };

  ws.onclose = () => {
    console.log('[ws] disconnected');
    useSwarmStore.getState().setConnected(false);
    scheduleReconnect();
  };

  ws.onerror = (err) => {
    console.error('[ws] error:', err);
  };
}

export function disconnectDashboard(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (ws) {
    ws.close();
    ws = null;
  }
}

function scheduleReconnect(): void {
  const delay = Math.min(
    RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempt),
    MAX_RECONNECT_DELAY_MS,
  );
  reconnectAttempt++;
  reconnectTimer = setTimeout(() => {
    console.log(`[ws] reconnecting (attempt ${reconnectAttempt})...`);
    connectDashboard();
  }, delay);
}

function handleMessage(msg: DashboardMessage): void {
  const swarm = useSwarmStore.getState();
  const cubes = useCubeStore.getState();

  switch (msg.type) {
    case 'full_state': {
      const data = msg.data as FullStateData;
      swarm.setNodes(data.nodes);
      swarm.setPlugins(data.plugins);
      for (const ch of data.channels) {
        cubes.updateChannel(ch);
      }
      break;
    }
    case 'node_update':
    case 'node_joined':
      swarm.upsertNode(msg.data as any);
      break;
    case 'node_died':
      swarm.removeNode((msg.data as any).id);
      break;
    case 'channel_update':
      cubes.updateChannel(msg.data as ChannelEntry);
      break;
    case 'audit_event':
      swarm.addAuditEvent(msg.data as any);
      break;
    case 'plugin_registered':
      swarm.upsertPlugin(msg.data as any);
      break;
    case 'plugin_died':
      swarm.removePlugin((msg.data as any).id);
      break;
    case 'heartbeat':
      // Keep-alive; no-op.
      break;
  }
}

/** Send a subscribe message to filter channels. */
export function subscribeChannels(traitFilter?: string): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'subscribe_channels',
      trait_filter: traitFilter ?? null,
    }));
  }
}
