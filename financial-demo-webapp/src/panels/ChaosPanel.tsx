/** Chaos engineering panel: buttons for kill, partition, cascade, rejoin. */

import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../store/ui';
import { THEME } from '../utils/colors';
import * as api from '../api/rest';
import type { ChaosStatus } from '../api/types';

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

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
  marginBottom: 6,
  textAlign: 'left',
};

export function ChaosPanel() {
  const activePanel = useUIStore((s) => s.activePanel);
  const [status, setStatus] = useState<ChaosStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [killCount, setKillCount] = useState(3);
  const [cascadeCount, setCascadeCount] = useState(5);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await api.chaosStatus();
      setStatus(s);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (activePanel === 'chaos') {
      refreshStatus();
      const interval = setInterval(refreshStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [activePanel, refreshStatus]);

  if (activePanel !== 'chaos') return null;

  const exec = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      await refreshStatus();
    } catch (err) {
      console.error('Chaos action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          color: THEME.danger,
          fontWeight: 'bold',
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        Chaos Engineering
      </div>

      {/* Kill N nodes */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: THEME.textDim, display: 'block', marginBottom: 4 }}>
          Kill random nodes:
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            min={1}
            max={100}
            value={killCount}
            onChange={(e) => setKillCount(Number(e.target.value))}
            style={{
              width: 60,
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              padding: '4px 6px',
              color: THEME.text,
              fontSize: 12,
            }}
          />
          <button
            style={{ ...btnStyle, background: THEME.danger, color: '#fff', width: 'auto', flex: 1 }}
            disabled={loading}
            onClick={() => exec(() => api.chaosKill(killCount))}
          >
            Kill
          </button>
        </div>
      </div>

      {/* Cascade failure */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ color: THEME.textDim, display: 'block', marginBottom: 4 }}>
          Cascade failure:
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            min={1}
            max={50}
            value={cascadeCount}
            onChange={(e) => setCascadeCount(Number(e.target.value))}
            style={{
              width: 60,
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              padding: '4px 6px',
              color: THEME.text,
              fontSize: 12,
            }}
          />
          <button
            style={{ ...btnStyle, background: '#b91c1c', color: '#fff', width: 'auto', flex: 1 }}
            disabled={loading}
            onClick={() => exec(() => api.chaosCascade(cascadeCount, 2000))}
          >
            Cascade
          </button>
        </div>
      </div>

      {/* Network partition */}
      <button
        style={{ ...btnStyle, background: THEME.warning, color: '#000' }}
        disabled={loading}
        onClick={() => exec(() => api.chaosPartition('demo-partition', []))}
      >
        Create Network Partition
      </button>

      {/* Rejoin / heal */}
      <button
        style={{ ...btnStyle, background: THEME.success, color: '#000' }}
        disabled={loading}
        onClick={() => exec(() => api.chaosRejoin())}
      >
        Rejoin All (Heal)
      </button>

      {/* Status display */}
      {status && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: THEME.accent, fontWeight: 'bold', marginBottom: 8 }}>
            Current State
          </div>
          <div style={{ padding: '3px 0', borderBottom: `1px solid ${THEME.border}` }}>
            <span style={{ color: THEME.textDim }}>Killed: </span>
            <span style={{ color: THEME.danger }}>{status.killed_count}</span>
          </div>
          <div style={{ padding: '3px 0', borderBottom: `1px solid ${THEME.border}` }}>
            <span style={{ color: THEME.textDim }}>Partitions: </span>
            <span>{status.partitions.length}</span>
          </div>
          <div style={{ padding: '3px 0', borderBottom: `1px solid ${THEME.border}` }}>
            <span style={{ color: THEME.textDim }}>Cascade: </span>
            <span style={{ color: status.cascade_active ? THEME.danger : THEME.textDim }}>
              {status.cascade_active ? 'ACTIVE' : 'idle'}
            </span>
          </div>

          {status.event_log.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ color: THEME.textDim, marginBottom: 4 }}>
                Recent events ({status.event_log.length}):
              </div>
              {status.event_log.slice(-10).reverse().map((evt, i) => (
                <div key={i} style={{ fontSize: 10, color: THEME.textDim, padding: '2px 0' }}>
                  [{evt.event_type}] {evt.timestamp.split('T')[1]?.slice(0, 8)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
