/** Multiple cubes rendered as a cluster (for multi-plugin scenarios). */

import React from 'react';
import { Cube } from './Cube';

interface Props {
  count?: number;
  spacing?: number;
}

/** Renders a single cube for now. In multi-plugin mode, this would
 *  tile cubes in a grid or ring layout. */
export function CubeCluster({ count = 1, spacing = 4 }: Props) {
  if (count <= 1) {
    return <Cube />;
  }

  // Grid layout for multiple cubes.
  const cols = Math.ceil(Math.sqrt(count));
  const cubes = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = (col - (cols - 1) / 2) * spacing;
    const z = (row - (Math.ceil(count / cols) - 1) / 2) * spacing;
    cubes.push(
      <group key={i} position={[x, 0, z]}>
        <Cube />
      </group>,
    );
  }

  return <>{cubes}</>;
}
