import type { CubePreset } from '../types/cube';

export const riskPreset: CubePreset = {
  name: 'Risk Management',
  description: 'Risk-focused view with VaR, concentration, counterparty, and liquidity.',
  faces: [
    { channel: 'fin.var', label: 'VaR', color: '#ef4444' },
    { channel: 'fin.concentration', label: 'Concentration', color: '#f59e0b' },
    { channel: 'fin.counterparty', label: 'Counterparty', color: '#8b5cf6' },
    { channel: 'fin.liquidity', label: 'Liquidity', color: '#06b6d4' },
    { channel: 'fin.sector_exposure', label: 'Sectors', color: '#10b981' },
    { channel: 'fin.compliance', label: 'Compliance', color: '#ec4899' },
  ],
};
