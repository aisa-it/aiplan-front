import type { DtoIssueSearchResult } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { httpClient } from '@/services/clients';

import type {
  IssueListSource,
  ProjectIssueListScope,
} from '../model/issue-list.types';

export const createProjectIssueListSource = (
  scope: ProjectIssueListScope,
): IssueListSource => ({
  async load(filters, query, signal) {
    const requestQuery = {
      hide_sub_issues: query.hideSubIssues,
      order_by: query.sortBy,
      offset: (query.page - 1) * query.rowsPerPage,
      limit: query.rowsPerPage,
      desc: query.descending,
      only_active: query.onlyActive,
      draft: query.draft,
      include_properties: query.includeProperties,
    };
    const response = await httpClient.post<DtoIssueSearchResult>(
      `/api/auth/workspaces/${encodeURIComponent(scope.workspaceSlug)}/projects/${encodeURIComponent(scope.projectId)}/issues/search`,
      filters,
      { params: requestQuery, signal },
    );

    return {
      items: response.data.issues ?? [],
      total: response.data.count ?? 0,
    };
  },
});
