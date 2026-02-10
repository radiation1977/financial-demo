/** Color utilities for the 3D scene. */

export const THEME = {
  bg: '#0a0a0f',
  surface: '#14141f',
  border: '#2a2a3f',
  text: '#e0e0e0',
  textDim: '#808090',
  accent: '#00d4ff',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#7c3aed',
} as const;

export function statusColor(status: string): string {
  switch (status) {
    case 'alive':
      return THEME.success;
    case 'suspect':
      return THEME.warning;
    case 'dead':
      return THEME.danger;
    case 'compliant':
      return THEME.success;
    case 'warning':
      return THEME.warning;
    case 'breach':
      return THEME.danger;
    default:
      return THEME.textDim;
  }
}

export function healthColor(health: number): string {
  if (health > 0.8) return THEME.success;
  if (health > 0.5) return THEME.warning;
  return THEME.danger;
}

/** Generate a color from a hash string (deterministic). */
export function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}
