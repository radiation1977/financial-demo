import type { CubePreset } from '../types/cube';

export const tradingPreset: CubePreset = {
  name: 'Trading Floor',
  description: 'Real-time trading view with P&L, Greeks, and compliance.',
  faces: [
    { channel: 'fin.portfolio', label: 'Portfolio', color: '#00d4ff' },
    { channel: 'fin.performance', label: 'P&L', color: '#10b981' },
    { channel: 'fin.greeks', label: 'Greeks', color: '#7c3aed' },
    { channel: 'fin.compliance', label: 'Compliance', color: '#ef4444' },
    { channel: 'fin.exposure', label: 'Exposure', color: '#f59e0b' },
    { channel: 'fin.actors', label: 'Actors', color: '#6366f1' },
  ],
};
