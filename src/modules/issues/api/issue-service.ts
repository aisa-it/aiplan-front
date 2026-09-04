import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { IssuesStatesFlow } from '@aisa-it/aiplan-api-ts/src/IssuesStatesFlow';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type { IssueFieldPatch } from '../model/issue-list.types';

const issuesApi = new (withInterceptors(Issues))();
const statesApi = new (withInterceptors(IssuesStatesFlow))();

export const issueService = {
  async update(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
    patch: IssueFieldPatch,
  ) {
    const { data } = await issuesApi.updateIssue(
      workspaceSlug,
      projectId,
      issueId,
      {
        issue: JSON.stringify(patch),
      },
    );
    return data;
  },

  async getAvailableStates(
    workspaceSlug: string,
    projectId: string,
    issueId: string,
  ) {
    const { data } = await statesApi.getAvailableStates(
      workspaceSlug,
      projectId,
      issueId,
    );
    return data ?? [];
  },
};
