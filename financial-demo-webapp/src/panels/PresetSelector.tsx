/** Preset selector dropdown for switching cube face configurations. */

import React, { useState } from 'react';
import { PRESETS } from '../presets';
import { useCubeStore } from '../store/cubes';
import { THEME } from '../utils/colors';

export function PresetSelector() {
  const activePreset = useCubeStore((s) => s.activePreset);
  const applyPreset = useCubeStore((s) => s.applyPreset);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: 4,
          padding: '4px 10px',
          color: THEME.accent,
          cursor: 'pointer',
          fontSize: 11,
          minWidth: 120,
          textAlign: 'left',
        }}
      >
        {activePreset} ▾
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            overflow: 'hidden',
            zIndex: 200,
            minWidth: 200,
          }}
        >
          {PRESETS.map((preset) => (
            <div
              key={preset.name}
              onClick={() => {
                applyPreset(preset);
                setOpen(false);
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: `1px solid ${THEME.border}`,
                background:
                  preset.name === activePreset ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>{preset.name}</div>
              <div style={{ fontSize: 10, color: THEME.textDim }}>{preset.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
