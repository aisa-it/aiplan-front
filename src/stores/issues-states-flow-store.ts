import { defineStore } from 'pinia';
import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IssuesStatesFlow } from '@aisa-it/aiplan-api-ts/src/IssuesStatesFlow';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(IssuesStatesFlow))();

export const useIssuesStatesFlowStore = defineStore('issues-states-flow', {
  state: () => ({}),
  actions: {
    async getAvailableStates(
      workspaceSlug: string,
      projectId: string,
      issueId: string,
    ): Promise<Record<string, DtoStateLight>> {
      const res = await api.getAvailableStates(workspaceSlug, projectId, issueId);
      return res.data ?? {};
    },
  },
});

