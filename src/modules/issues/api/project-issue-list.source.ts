import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';

import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

import type {
  IssueListSource,
  ProjectIssueListScope,
} from '../model/issue-list.types';

const issuesApi = new (withInterceptors(Issues))();

export const createProjectIssueListSource = (
  scope: ProjectIssueListScope,
): IssueListSource => ({
  scope,

  async load(filters, query, signal) {
    const response = await issuesApi.getIssueList(
      {
        ...filters,
        projects: [scope.projectId],
      },
      {
        hide_sub_issues: query.hideSubIssues,
        order_by: query.sortBy,
        offset: (query.page - 1) * query.rowsPerPage,
        limit: query.rowsPerPage,
        desc: query.descending,
        only_active: query.onlyActive,
      },
      { signal },
    );

    return {
      items: response.data.issues ?? [],
      total: response.data.count ?? 0,
    };
  },
});
