/** Unfold animation controller: transitions between cube and cross layout. */

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUIStore } from '../store/ui';

/** Controls the unfold transition. This is a non-visual component that
 *  manages animation state. The actual interpolation happens in CubeFace
 *  based on the `exploded` flag in the UI store. */
export function UnfoldAnimation() {
  const exploded = useUIStore((s) => s.exploded);
  const progressRef = useRef(exploded ? 1 : 0);

  useFrame((_, delta) => {
    const target = exploded ? 1 : 0;
    progressRef.current += (target - progressRef.current) * Math.min(delta * 4, 1);
  });

  return null;
}
