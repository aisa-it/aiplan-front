import { defineStore } from 'pinia';
import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { ProjectsStatesFlow } from '@aisa-it/aiplan-api-ts/src/ProjectsStatesFlow';

const api = new (withInterceptors(ProjectsStatesFlow))();

export const useProjectStatesFlowStore = defineStore('project-states-flow', {
  state: () => ({}),
  actions: {
    async getAvailableStatesNewIssue(
      workspaceSlug: string,
      projectId: string,
    ): Promise<DtoStateLight[]> {
      const res = await api.getStartStates(workspaceSlug, projectId);
      return res.data ?? {};
    },
  },
});

