/** Gossip edge visualization: animated lines between active nodes. */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSwarmStore } from '../store/swarm';
import { fibonacciSphere } from '../utils/layout';

const MAX_EDGES = 500;
const EDGE_OPACITY = 0.15;
const CLOUD_RADIUS = 6;

export function GossipEdges() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const nodes = useSwarmStore((s) => s.nodes);

  const liveNodes = useMemo(
    () => [...nodes.values()].filter((n) => n.status === 'alive'),
    [nodes],
  );

  const positions = useMemo(
    () => fibonacciSphere(Math.max(liveNodes.length, 1), CLOUD_RADIUS),
    [liveNodes.length],
  );

  // Build edge pairs: each node connects to ~3 random peers (gossip fanout).
  const linePositions = useMemo(() => {
    if (liveNodes.length < 2) return new Float32Array(0);

    const arr: number[] = [];
    const fanout = 3;
    let edgeCount = 0;

    for (let i = 0; i < liveNodes.length && edgeCount < MAX_EDGES; i++) {
      const from = positions[i];
      if (!from) continue;

      // Deterministic peer selection (based on node index).
      for (let f = 0; f < fanout && edgeCount < MAX_EDGES; f++) {
        const peerIdx = (i * 7 + f * 13 + 1) % liveNodes.length;
        if (peerIdx === i) continue;

        const to = positions[peerIdx];
        if (!to) continue;

        arr.push(from.x, from.y, from.z, to.x, to.y, to.z);
        edgeCount++;
      }
    }
    return new Float32Array(arr);
  }, [liveNodes.length, positions]);

  useEffect(() => {
    if (lineRef.current && linePositions.length > 0) {
      lineRef.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3),
      );
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  }, [linePositions]);

  // Rotate with the node cloud.
  useFrame((_, delta) => {
    if (lineRef.current) {
      lineRef.current.rotation.y += delta * 0.02;
    }
  });

  if (linePositions.length === 0) return null;

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial
        color="#3060a0"
        transparent
        opacity={EDGE_OPACITY}
        linewidth={1}
      />
    </lineSegments>
  );
}
