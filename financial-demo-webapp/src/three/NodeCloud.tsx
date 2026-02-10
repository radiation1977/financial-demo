/** Node cloud: renders swarm nodes as instanced spheres. */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSwarmStore } from '../store/swarm';
import { statusColor } from '../utils/colors';
import { fibonacciSphere } from '../utils/layout';

const NODE_RADIUS = 0.04;
const CLOUD_RADIUS = 6;
const MAX_RENDERED_NODES = 5000;

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function NodeCloud() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const nodes = useSwarmStore((s) => s.nodes);

  const nodeArray = useMemo(() => {
    const arr = [...nodes.values()];
    return arr.slice(0, MAX_RENDERED_NODES);
  }, [nodes]);

  // Pre-compute positions on a sphere.
  const positions = useMemo(
    () => fibonacciSphere(Math.max(nodeArray.length, 1), CLOUD_RADIUS),
    [nodeArray.length],
  );

  // Update instance matrices and colors.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const colorAttr = new Float32Array(MAX_RENDERED_NODES * 3);

    for (let i = 0; i < nodeArray.length; i++) {
      const node = nodeArray[i];
      const pos = positions[i];
      tempObject.position.copy(pos);

      // Dead nodes shrink.
      const scale = node.status === 'dead' ? 0.3 : node.status === 'suspect' ? 0.6 : 1.0;
      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();
      mesh.setMatrixAt(i, tempObject.matrix);

      // Color by status.
      tempColor.set(statusColor(node.status));
      colorAttr[i * 3] = tempColor.r;
      colorAttr[i * 3 + 1] = tempColor.g;
      colorAttr[i * 3 + 2] = tempColor.b;
    }

    mesh.count = nodeArray.length;
    mesh.instanceMatrix.needsUpdate = true;

    // Set instance colors.
    mesh.geometry.setAttribute(
      'color',
      new THREE.InstancedBufferAttribute(colorAttr, 3),
    );
  }, [nodeArray, positions]);

  // Gentle orbital motion.
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_RENDERED_NODES]}>
      <sphereGeometry args={[NODE_RADIUS, 8, 6]} />
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.9}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
}
