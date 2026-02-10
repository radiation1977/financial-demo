/** Death animation: particles emanating from dead node positions. */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSwarmStore } from '../store/swarm';

const PARTICLE_COUNT = 50;

export function DeadNodeEffect() {
  const pointsRef = useRef<THREE.Points>(null);
  const nodes = useSwarmStore((s) => s.nodes);

  const deadNodes = useMemo(
    () => [...nodes.values()].filter((n) => n.status === 'dead'),
    [nodes],
  );

  // Simple fade-out animation.
  useFrame((_, delta) => {
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 0.5);
    }
  });

  if (deadNodes.length === 0) return null;

  // Generate particles around dead node positions.
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, [deadNodes.length]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ef4444"
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
