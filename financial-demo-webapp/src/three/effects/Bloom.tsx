/** Bloom post-processing effect for glow. */

import React from 'react';
import { EffectComposer, Bloom as BloomEffect } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

export function Bloom() {
  return (
    <EffectComposer>
      <BloomEffect
        intensity={0.8}
        kernelSize={KernelSize.LARGE}
        luminanceThreshold={0.4}
        luminanceSmoothing={0.3}
      />
    </EffectComposer>
  );
}
