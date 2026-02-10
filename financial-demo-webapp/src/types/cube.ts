/** Types for the Cube visualization. */

export interface CubeFace {
  /** Channel name, e.g. "fin.portfolio" */
  channel: string;
  /** Human-readable label shown on the face */
  label: string;
  /** Face index (0-5) on the cube */
  faceIndex: number;
  /** Latest payload data from the channel */
  data: unknown;
  /** Timestamp of the last update (ms) */
  updatedAt: number;
  /** Color accent for the face */
  color: string;
}

export interface CubePreset {
  name: string;
  description: string;
  faces: {
    channel: string;
    label: string;
    color: string;
  }[];
}

/** State for a decomposition drill-down. */
export interface DrillState {
  /** Depth stack of [axis, filter] pairs. */
  path: { axis: string; filter: string | null }[];
  /** Current decomposition results. */
  result: unknown | null;
  /** Whether a query is in-flight. */
  loading: boolean;
}

export type CameraMode = 'orbit' | 'fly' | 'follow';

export interface SelectedEntity {
  type: 'node' | 'cube' | 'face' | 'edge';
  id: string;
}
