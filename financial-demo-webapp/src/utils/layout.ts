/** Layout utilities for 3D positioning. */

import * as THREE from 'three';

/** Calculate cube face positions and rotations for unfolded (cross) layout. */
export function unfoldedPositions(): { position: THREE.Vector3; rotation: THREE.Euler }[] {
  const s = 2.2; // spacing between faces when unfolded
  return [
    // Front face (center of the cross)
    { position: new THREE.Vector3(0, 0, 0), rotation: new THREE.Euler(0, 0, 0) },
    // Right
    { position: new THREE.Vector3(s, 0, 0), rotation: new THREE.Euler(0, 0, 0) },
    // Left
    { position: new THREE.Vector3(-s, 0, 0), rotation: new THREE.Euler(0, 0, 0) },
    // Top
    { position: new THREE.Vector3(0, s, 0), rotation: new THREE.Euler(0, 0, 0) },
    // Bottom
    { position: new THREE.Vector3(0, -s, 0), rotation: new THREE.Euler(0, 0, 0) },
    // Back (below bottom in cross layout)
    { position: new THREE.Vector3(0, -2 * s, 0), rotation: new THREE.Euler(0, 0, 0) },
  ];
}

/** Calculate cube face positions for assembled cube. */
export function cubePositions(): { position: THREE.Vector3; rotation: THREE.Euler }[] {
  return [
    // Front (+Z)
    { position: new THREE.Vector3(0, 0, 1), rotation: new THREE.Euler(0, 0, 0) },
    // Back (-Z)
    { position: new THREE.Vector3(0, 0, -1), rotation: new THREE.Euler(0, Math.PI, 0) },
    // Right (+X)
    { position: new THREE.Vector3(1, 0, 0), rotation: new THREE.Euler(0, Math.PI / 2, 0) },
    // Left (-X)
    { position: new THREE.Vector3(-1, 0, 0), rotation: new THREE.Euler(0, -Math.PI / 2, 0) },
    // Top (+Y)
    { position: new THREE.Vector3(0, 1, 0), rotation: new THREE.Euler(-Math.PI / 2, 0, 0) },
    // Bottom (-Y)
    { position: new THREE.Vector3(0, -1, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
  ];
}

/** Sphere packing for node cloud: position N nodes on a sphere. */
export function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
    const r = Math.sqrt(1 - y * y) * radius;
    const theta = goldenAngle * i;
    points.push(new THREE.Vector3(
      Math.cos(theta) * r,
      y * radius,
      Math.sin(theta) * r,
    ));
  }
  return points;
}
