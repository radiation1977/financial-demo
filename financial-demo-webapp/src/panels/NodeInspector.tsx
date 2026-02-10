/** Node inspector panel: shows details for selected nodes. */

import React from 'react';
import { useSwarmStore } from '../store/swarm';
import { useUIStore } from '../store/ui';
import { THEME, statusColor, healthColor } from '../utils/colors';
import { formatRelative, truncate } from '../utils/format';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 56,
  right: 8,
  bottom: 8,
  width: 320,
  background: 'rgba(20, 20, 31, 0.95)',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  padding: 16,
  overflow: 'auto',
  zIndex: 50,
  backdropFilter: 'blur(8px)',
  fontSize: 12,
};

const sectionTitle: React.CSSProperties = {
  color: THEME.accent,
  fontWeight: 'bold',
  marginBottom: 8,
  fontSize: 13,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '3px 0',
  borderBottom: `1px solid ${THEME.border}`,
};

export function NodeInspector() {
  const activePanel = useUIStore((s) => s.activePanel);
  const nodes = useSwarmStore((s) => s.nodes);
  const nodeCount = useSwarmStore((s) => s.nodeCount);
  const liveNodeCount = useSwarmStore((s) => s.liveNodeCount);

  if (activePanel !== 'inspector') return null;

  const nodeArray = [...nodes.values()].slice(0, 100);
  const deadCount = [...nodes.values()].filter((n) => n.status === 'dead').length;
  const suspectCount = [...nodes.values()].filter((n) => n.status === 'suspect').length;

  return (
    <div style={panelStyle}>
      <div style={sectionTitle}>Node Overview</div>

      <div style={rowStyle}>
        <span style={{ color: THEME.textDim }}>Total</span>
        <span>{nodeCount}</span>
      </div>
      <div style={rowStyle}>
        <span style={{ color: THEME.textDim }}>Alive</span>
        <span style={{ color: THEME.success }}>{liveNodeCount}</span>
      </div>
      <div style={rowStyle}>
        <span style={{ color: THEME.textDim }}>Suspect</span>
        <span style={{ color: THEME.warning }}>{suspectCount}</span>
      </div>
      <div style={rowStyle}>
        <span style={{ color: THEME.textDim }}>Dead</span>
        <span style={{ color: THEME.danger }}>{deadCount}</span>
      </div>

      <div style={{ ...sectionTitle, marginTop: 16 }}>Nodes (first 100)</div>

      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {nodeArray.map((node) => (
          <div
            key={node.id}
            style={{
              ...rowStyle,
              gap: 8,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusColor(node.status),
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <span style={{ flex: 1 }}>{truncate(node.id, 16)}</span>
            <span style={{ color: healthColor(node.health) }}>
              {(node.health * 100).toFixed(0)}%
            </span>
            <span style={{ color: THEME.textDim, fontSize: 10 }}>
              {formatRelative(node.last_seen)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
