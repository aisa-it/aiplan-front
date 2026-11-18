import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

import type { ProjectIssueListScope } from '../model/issue-list.types';

const issuesApi = new (withInterceptors(Issues))();

export const loadPinnedIssues = async (
  scope: ProjectIssueListScope,
  offset: number,
  limit: number,
  signal: AbortSignal,
) => {
  const response = await issuesApi.getIssueList(
    { projects: [scope.projectId] },
    { offset, limit, only_pinned: true },
    { signal },
  );

  return {
    items: response.data.issues ?? [],
    total: response.data.count ?? 0,
  };
};
