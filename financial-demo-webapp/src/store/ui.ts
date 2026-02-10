/** Zustand store: UI state — panels, selection, camera. */

import { create } from 'zustand';
import type { CameraMode, SelectedEntity } from '../types/cube';

interface UIState {
  /** Which side panel is open. */
  activePanel: 'none' | 'inspector' | 'audit' | 'workflow' | 'chaos';
  /** Currently selected entity. */
  selected: SelectedEntity | null;
  /** Camera mode. */
  cameraMode: CameraMode;
  /** Whether the scene is in "exploded" (unfolded) view. */
  exploded: boolean;
  /** Search query for filtering. */
  searchQuery: string;

  // Actions
  setPanel: (panel: UIState['activePanel']) => void;
  setSelected: (entity: SelectedEntity | null) => void;
  setCameraMode: (mode: CameraMode) => void;
  setExploded: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: 'none',
  selected: null,
  cameraMode: 'orbit',
  exploded: false,
  searchQuery: '',

  setPanel: (panel) => set({ activePanel: panel }),
  setSelected: (entity) => set({ selected: entity }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setExploded: (v) => set({ exploded: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
