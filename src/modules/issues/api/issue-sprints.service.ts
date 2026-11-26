import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import { sprintService } from '@/modules/sprints/api/sprint.service';

const sprintApi = new (withInterceptors(Sprint))();

export const issueSprintsService = {
  list: sprintService.list,

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
