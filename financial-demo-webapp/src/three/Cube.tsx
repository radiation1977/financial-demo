/** THE CUBE — central 3D cube with 6 data faces. */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CubeFace } from './CubeFace';
import { useCubeStore } from '../store/cubes';
import { useUIStore } from '../store/ui';
import { cubePositions, unfoldedPositions } from '../utils/layout';

export function Cube() {
  const groupRef = useRef<THREE.Group>(null);
  const faces = useCubeStore((s) => s.faces);
  const exploded = useUIStore((s) => s.exploded);

  const assembled = useMemo(() => cubePositions(), []);
  const unfolded = useMemo(() => unfoldedPositions(), []);

  // Gentle spin when not exploded.
  useFrame((_, delta) => {
    if (groupRef.current && !exploded) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const layouts = exploded ? unfolded : assembled;

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Wireframe cube shell */}
      {!exploded && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2.02, 2.02, 2.02)]} />
          <lineBasicMaterial color="#2a2a4f" transparent opacity={0.3} />
        </lineSegments>
      )}

      {/* Data faces */}
      {faces.map((face, i) => (
        <CubeFace
          key={face.channel}
          face={face}
          position={layouts[i]?.position ?? new THREE.Vector3()}
          rotation={layouts[i]?.rotation ?? new THREE.Euler()}
          exploded={exploded}
        />
      ))}
    </group>
  );
}
