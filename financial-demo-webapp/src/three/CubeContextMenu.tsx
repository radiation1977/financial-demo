/** Context menu for cube face interactions (decomposition, drill-down). */

import React from 'react';
import { Html } from '@react-three/drei';
import { useUIStore } from '../store/ui';
import { useCubeStore } from '../store/cubes';
import { decompose } from '../api/rest';
import type { DecompositionResult } from '../api/types';

export function CubeContextMenu() {
  const selected = useUIStore((s) => s.selected);
  const setDrill = useCubeStore((s) => s.setDrill);

  if (!selected || selected.type !== 'face') return null;

  const channel = selected.id;

  const handleDecompose = async (axis: string) => {
    setDrill({
      path: [{ axis, filter: null }],
      result: null,
      loading: true,
    });

    try {
      const result: DecompositionResult = await decompose(channel, axis);
      setDrill({
        path: [{ axis, filter: null }],
        result,
        loading: false,
      });
    } catch (err) {
      console.error('Decomposition failed:', err);
      setDrill(null);
    }
  };

  return (
    <Html position={[2.5, 1, 0]} style={{ pointerEvents: 'auto' }}>
      <div
        style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4f',
          borderRadius: 8,
          padding: 12,
          minWidth: 160,
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#e0e0e0',
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#00d4ff' }}>
          {channel}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['strategy', 'sector', 'geography', 'instrument_type', 'counterparty'].map(
            (axis) => (
              <button
                key={axis}
                onClick={() => handleDecompose(axis)}
                style={{
                  background: '#14141f',
                  border: '1px solid #2a2a4f',
                  borderRadius: 4,
                  padding: '4px 8px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 11,
                }}
              >
                By {axis.replace('_', ' ')}
              </button>
            ),
          )}
        </div>
      </div>
    </Html>
  );
}
