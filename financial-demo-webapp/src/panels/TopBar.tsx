/** Top navigation bar with connection status, metrics, and controls. */

import React from 'react';
import { useSwarmStore } from '../store/swarm';
import { useCubeStore } from '../store/cubes';
import { useUIStore } from '../store/ui';
import { formatCompact } from '../utils/format';
import { THEME } from '../utils/colors';
import { PresetSelector } from './PresetSelector';

const barStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  background: 'rgba(10, 10, 15, 0.9)',
  borderBottom: `1px solid ${THEME.border}`,
  zIndex: 100,
  backdropFilter: 'blur(8px)',
};

const metricStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  fontSize: 12,
};

const dotStyle = (connected: boolean): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: connected ? THEME.success : THEME.danger,
  boxShadow: connected ? `0 0 6px ${THEME.success}` : `0 0 6px ${THEME.danger}`,
});

const btnStyle: React.CSSProperties = {
  background: THEME.surface,
  border: `1px solid ${THEME.border}`,
  borderRadius: 4,
  padding: '4px 10px',
  color: THEME.text,
  cursor: 'pointer',
  fontSize: 11,
};

export function TopBar() {
  const connected = useSwarmStore((s) => s.connected);
  const nodeCount = useSwarmStore((s) => s.nodeCount);
  const liveNodeCount = useSwarmStore((s) => s.liveNodeCount);
  const pluginCount = useSwarmStore((s) => s.plugins.size);
  const exploded = useUIStore((s) => s.exploded);
  const setExploded = useUIStore((s) => s.setExploded);
  const setPanel = useUIStore((s) => s.setPanel);
  const activePanel = useUIStore((s) => s.activePanel);

  return (
    <div style={barStyle}>
      {/* Left: logo + connection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 'bold', color: THEME.accent, fontSize: 14 }}>
          CAMBRIAN
        </span>
        <div style={dotStyle(connected)} />
        <span style={{ color: THEME.textDim, fontSize: 11 }}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Center: metrics */}
      <div style={metricStyle}>
        <span>
          <span style={{ color: THEME.textDim }}>Nodes: </span>
          <span style={{ color: THEME.success }}>{formatCompact(liveNodeCount)}</span>
          <span style={{ color: THEME.textDim }}>/{formatCompact(nodeCount)}</span>
        </span>
        <span>
          <span style={{ color: THEME.textDim }}>Plugins: </span>
          <span>{pluginCount}</span>
        </span>
        <PresetSelector />
      </div>

      {/* Right: controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={{
            ...btnStyle,
            background: exploded ? THEME.accent : THEME.surface,
            color: exploded ? '#000' : THEME.text,
          }}
          onClick={() => setExploded(!exploded)}
        >
          {exploded ? 'Fold' : 'Unfold'}
        </button>
        {(['inspector', 'audit', 'chaos'] as const).map((panel) => (
          <button
            key={panel}
            style={{
              ...btnStyle,
              background: activePanel === panel ? THEME.accent : THEME.surface,
              color: activePanel === panel ? '#000' : THEME.text,
            }}
            onClick={() => setPanel(activePanel === panel ? 'none' : panel)}
          >
            {panel.charAt(0).toUpperCase() + panel.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
