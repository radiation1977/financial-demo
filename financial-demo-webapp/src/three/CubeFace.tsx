/** A single face of the cube showing channel data. */

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { CubeFace as CubeFaceType } from '../types/cube';
import { useUIStore } from '../store/ui';
import { formatCurrency } from '../utils/format';

interface Props {
  face: CubeFaceType;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  exploded: boolean;
}

export function CubeFace({ face, position, rotation, exploded }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setSelected = useUIStore((s) => s.setSelected);

  const size = exploded ? 2.0 : 1.98;

  // Extract key metric for display.
  const metric = useMemo(() => {
    if (!face.data) return '';
    const d = face.data as Record<string, unknown>;
    if (d.nav !== undefined) return formatCurrency(d.nav as number);
    if (d.status !== undefined) return String(d.status).toUpperCase();
    if (d.option_count !== undefined) return `${d.option_count} options`;
    if (d.simulations !== undefined) return `${d.simulations} sims`;
    if (d.violation_count !== undefined) {
      const vc = d.violation_count as number;
      return vc === 0 ? 'CLEAN' : `${vc} violations`;
    }
    return '';
  }, [face.data]);

  // Pulse opacity on data update.
  const pulseRef = useRef(0);
  useFrame((_, delta) => {
    if (pulseRef.current > 0) {
      pulseRef.current = Math.max(0, pulseRef.current - delta * 2);
    }
  });

  // Trigger pulse when data changes.
  const prevUpdatedRef = useRef(face.updatedAt);
  if (face.updatedAt !== prevUpdatedRef.current) {
    prevUpdatedRef.current = face.updatedAt;
    pulseRef.current = 1;
  }

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() =>
          setSelected({ type: 'face', id: face.channel })
        }
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={face.color}
          transparent
          opacity={hovered ? 0.85 : 0.6}
          side={THREE.DoubleSide}
          emissive={face.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.6, 0.01]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/JetBrainsMono-Bold.ttf"
      >
        {face.label}
      </Text>

      {/* Metric value */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {metric}
      </Text>

      {/* Update indicator */}
      {face.data && (
        <Text
          position={[0, -0.7, 0.01]}
          fontSize={0.1}
          color="#808090"
          anchorX="center"
          anchorY="middle"
        >
          {face.channel}
        </Text>
      )}
    </group>
  );
}
