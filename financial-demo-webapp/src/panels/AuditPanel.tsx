/** Audit panel: shows real-time audit event stream. */

import React from 'react';
import { useSwarmStore } from '../store/swarm';
import { useUIStore } from '../store/ui';
import { THEME } from '../utils/colors';

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  top: 56,
  right: 8,
  bottom: 8,
  width: 360,
  background: 'rgba(20, 20, 31, 0.95)',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  padding: 16,
  overflow: 'auto',
  zIndex: 50,
  backdropFilter: 'blur(8px)',
  fontSize: 12,
};

const eventStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: `1px solid ${THEME.border}`,
};

export function AuditPanel() {
  const activePanel = useUIStore((s) => s.activePanel);
  const auditLog = useSwarmStore((s) => s.auditLog);

  if (activePanel !== 'audit') return null;

  return (
    <div style={panelStyle}>
      <div
        style={{
          color: THEME.accent,
          fontWeight: 'bold',
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        Audit Stream ({auditLog.length} events)
      </div>

      {auditLog.length === 0 && (
        <div style={{ color: THEME.textDim }}>No audit events yet.</div>
      )}

      {auditLog.map((event, i) => (
        <div key={i} style={eventStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: THEME.accent }}>{event.event_type}</span>
            <span style={{ color: THEME.textDim, fontSize: 10 }}>
              {event.timestamp}
            </span>
          </div>
          <div style={{ color: THEME.textDim, fontSize: 10, marginTop: 2 }}>
            {typeof event.details === 'object'
              ? JSON.stringify(event.details).slice(0, 100)
              : String(event.details)}
          </div>
        </div>
      ))}
    </div>
  );
}
