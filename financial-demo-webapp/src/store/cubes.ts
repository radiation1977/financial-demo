/** Zustand store: cube channel-to-face mapping and data. */

import { create } from 'zustand';
import type { ChannelEntry } from '../api/types';
import type { CubeFace, DrillState, CubePreset } from '../types/cube';
import { PRESETS } from '../presets';

interface CubeState {
  /** The 6 cube faces. */
  faces: CubeFace[];
  /** Active preset name. */
  activePreset: string;
  /** Latest raw channel payloads keyed by channel name. */
  channelData: Map<string, unknown>;
  /** Channel update timestamps. */
  channelUpdated: Map<string, number>;
  /** Drill-down state (if user has clicked into a face). */
  drill: DrillState | null;

  // Actions
  applyPreset: (preset: CubePreset) => void;
  updateChannel: (entry: ChannelEntry) => void;
  setDrill: (drill: DrillState | null) => void;
}

const FACE_COLORS = [
  '#00d4ff', '#ff6b35', '#7c3aed',
  '#10b981', '#f59e0b', '#ef4444',
];

function makeFaces(preset: CubePreset): CubeFace[] {
  return preset.faces.map((f, i) => ({
    channel: f.channel,
    label: f.label,
    faceIndex: i,
    data: null,
    updatedAt: 0,
    color: f.color || FACE_COLORS[i % FACE_COLORS.length],
  }));
}

export const useCubeStore = create<CubeState>((set, get) => ({
  faces: makeFaces(PRESETS[0]),
  activePreset: PRESETS[0].name,
  channelData: new Map(),
  channelUpdated: new Map(),
  drill: null,

  applyPreset: (preset) => {
    set({
      faces: makeFaces(preset),
      activePreset: preset.name,
      drill: null,
    });
  },

  updateChannel: (entry) => {
    const { faces, channelData, channelUpdated } = get();

    // Update raw data.
    const newData = new Map(channelData);
    newData.set(entry.channel, entry.payload);
    const newUpdated = new Map(channelUpdated);
    newUpdated.set(entry.channel, entry.updated_at);

    // Update any face that displays this channel.
    const newFaces = faces.map((f) =>
      f.channel === entry.channel
        ? { ...f, data: entry.payload, updatedAt: entry.updated_at }
        : f,
    );

    set({
      faces: newFaces,
      channelData: newData,
      channelUpdated: newUpdated,
    });
  },

  setDrill: (drill) => set({ drill }),
}));
