/** Zustand store: workflow instance tracking. */

import { create } from 'zustand';

export interface WorkflowStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  output?: unknown;
}

export interface WorkflowInstance {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: number;
}

interface WorkflowState {
  workflows: Map<string, WorkflowInstance>;
  upsertWorkflow: (wf: WorkflowInstance) => void;
  removeWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: new Map(),

  upsertWorkflow: (wf) => {
    const workflows = new Map(get().workflows);
    workflows.set(wf.id, wf);
    set({ workflows });
  },

  removeWorkflow: (id) => {
    const workflows = new Map(get().workflows);
    workflows.delete(id);
    set({ workflows });
  },
}));
