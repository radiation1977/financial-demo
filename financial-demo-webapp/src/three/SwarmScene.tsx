/** Top-level Three.js scene containing the cube, node cloud, and effects. */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Cube } from './Cube';
import { NodeCloud } from './NodeCloud';
import { GossipEdges } from './GossipEdges';
import { Bloom } from './effects/Bloom';
import { THEME } from '../utils/colors';

export function SwarmScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={60} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={50}
      />

      <color attach="background" args={[THEME.bg]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} color="#4060ff" />

      <Suspense fallback={null}>
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
        <Cube />
        <NodeCloud />
        <GossipEdges />
      </Suspense>

      <Bloom />
    </Canvas>
  );
}
