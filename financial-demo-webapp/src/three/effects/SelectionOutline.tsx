/** Selection outline effect for highlighted objects. */

import React from 'react';
import { useUIStore } from '../../store/ui';

/** Placeholder for selection outline effect.
 *  In production, this would use @react-three/postprocessing Outline effect.
 */
export function SelectionOutline() {
  const selected = useUIStore((s) => s.selected);
  // The outline effect is applied via the EffectComposer in Bloom.tsx.
  // This component manages the selection refs.
  return null;
}
