/** Workflow panel: shows active workflow instances and their steps. */

import React from 'react';
import { useWorkflowStore } from '../store/workflow';
import { useUIStore } from '../store/ui';
import { THEME, statusColor } from '../utils/colors';

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

function stepStatusColor(status: string): string {
  switch (status) {
    case 'completed': return THEME.success;
    case 'running': return THEME.accent;
    case 'failed': return THEME.danger;
    default: return THEME.textDim;
  }
}

export function WorkflowPanel() {
  const activePanel = useUIStore((s) => s.activePanel);
  const workflows = useWorkflowStore((s) => s.workflows);

  if (activePanel !== 'workflow') return null;

  const wfArray = [...workflows.values()];

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
        Workflows ({wfArray.length})
      </div>

      {wfArray.length === 0 && (
        <div style={{ color: THEME.textDim }}>No active workflows.</div>
      )}

      {wfArray.map((wf) => (
        <div
          key={wf.id}
          style={{
            marginBottom: 12,
            padding: 8,
            background: THEME.surface,
            borderRadius: 6,
            border: `1px solid ${THEME.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <span style={{ fontWeight: 'bold' }}>{wf.name}</span>
            <span style={{ color: statusColor(wf.status), fontSize: 10 }}>
              {wf.status.toUpperCase()}
            </span>
          </div>

          {wf.steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 0',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: stepStatusColor(step.status),
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, color: THEME.textDim }}>{step.name}</span>
              <span style={{ fontSize: 10, color: stepStatusColor(step.status) }}>
                {step.status}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
