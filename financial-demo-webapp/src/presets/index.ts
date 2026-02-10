import type { CubePreset } from '../types/cube';
import { tradingPreset } from './trading';
import { riskPreset } from './risk';

export const PRESETS: CubePreset[] = [tradingPreset, riskPreset];

export function getPreset(name: string): CubePreset | undefined {
  return PRESETS.find((p) => p.name === name);
}
