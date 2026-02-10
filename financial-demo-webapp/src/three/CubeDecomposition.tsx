/** Decomposition drill-down visualization: treemap-like subdivisions. */

import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCubeStore } from '../store/cubes';
import type { DecompositionResult } from '../api/types';
import { formatCurrency } from '../utils/format';
import { hashColor } from '../utils/colors';

export function CubeDecomposition() {
  const drill = useCubeStore((s) => s.drill);

  if (!drill || !drill.result) return null;

  const result = drill.result as DecompositionResult;
  const children = result.children ?? [];

  if (children.length === 0) return null;

  // Layout children as horizontal bars.
  const totalMv = result.total_market_value ?? 1;
  const barWidth = 3.5;
  const barHeight = 0.3;
  const startY = (children.length * (barHeight + 0.1)) / 2;

  return (
    <group position={[4, 0.5, 0]}>
      {/* Title */}
      <Text
        position={[0, startY + 0.5, 0]}
        fontSize={0.2}
        color="#e0e0e0"
        anchorX="center"
      >
        {`Decomposition: ${result.axis}`}
      </Text>

      {children.map((child, i) => {
        const y = startY - i * (barHeight + 0.1);
        const widthPct = Math.abs(child.market_value) / Math.max(Math.abs(totalMv), 1);
        const w = Math.max(widthPct * barWidth, 0.1);
        const color = hashColor(child.key);

        return (
          <group key={child.key} position={[0, y, 0]}>
            {/* Bar */}
            <mesh position={[-(barWidth - w) / 2, 0, 0]}>
              <planeGeometry args={[w, barHeight]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.7}
                emissive={color}
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* Label */}
            <Text
              position={[-barWidth / 2 - 0.1, 0, 0]}
              fontSize={0.12}
              color="#e0e0e0"
              anchorX="right"
              anchorY="middle"
            >
              {child.label}
            </Text>

            {/* Value */}
            <Text
              position={[barWidth / 2 + 0.1, 0, 0]}
              fontSize={0.1}
              color="#808090"
              anchorX="left"
              anchorY="middle"
            >
              {formatCurrency(child.market_value)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
