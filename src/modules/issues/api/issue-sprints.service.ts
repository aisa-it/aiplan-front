import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

const sprintApi = new (withInterceptors(Sprint))();

export const issueSprintsService = {
  async list(workspaceSlug: string, signal: AbortSignal) {
    const { data } = await sprintApi.getSprintList(workspaceSlug, { signal });
    return data ?? [];
  },

  async setMembership(
    workspaceSlug: string,
    sprintId: string,
    issueId: string,
    included: boolean,
  ) {
    await sprintApi.sprintIssuesUpdate(workspaceSlug, sprintId, {
      issues_add: included ? [issueId] : [],
      issues_remove: included ? [] : [issueId],
    });
  },
};
