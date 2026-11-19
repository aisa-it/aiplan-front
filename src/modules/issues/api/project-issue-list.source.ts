import type { DtoIssueSearchResult } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { httpClient } from '@/services/clients';

import type {
  IssueListQuery,
  IssueListSource,
  ProjectIssueListScope,
} from '../model/issue-list.types';
import { filtersForIssueGroup } from '../model/issue-groups';
import type {
  GroupIssueFilters,
  GroupedIssueSource,
} from '../model/issue-groups';
import { readIssueGroups } from './read-issue-groups';

const getRequestQuery = (query: IssueListQuery) => ({
  hide_sub_issues: query.hideSubIssues,
  order_by: query.sortBy,
  offset: (query.page - 1) * query.rowsPerPage,
  limit: query.rowsPerPage,
  desc: query.descending,
  only_active: query.onlyActive,
  draft: query.draft,
  include_properties: query.includeProperties,
});

export class IssueGroupRequestError extends Error {
  readonly body?: { code?: number; ru_error?: string };

  constructor(status: number, body?: { code?: number; ru_error?: string }) {
    super(body?.ru_error ?? `HTTP ${status}`);
    this.body = body;
  }
}

export const createProjectIssueListSource = (
  scope: ProjectIssueListScope,
): IssueListSource & GroupedIssueSource => {
  const endpoint = `/api/auth/workspaces/${encodeURIComponent(scope.workspaceSlug)}/projects/${encodeURIComponent(scope.projectId)}/issues/search`;

  const load = async (
    filters: GroupIssueFilters,
    query: IssueListQuery,
    signal?: AbortSignal,
  ) => {
    const { data } = await httpClient.post<DtoIssueSearchResult>(
      endpoint,
      filters,
      {
        params: getRequestQuery(query),
        signal,
      },
    );
    return { items: data.issues ?? [], total: data.count ?? 0 };
  };

  return {
    load,
    async streamGroups(filters, query, groupBy, onGroup, signal) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries({
        ...getRequestQuery({ ...query, page: 1 }),
        group_by: groupBy,
        stream: true,
      })) {
        params.set(key, String(value));
      }
      const response = await fetch(`${endpoint}?${params}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/x-ndjson, application/json',
        },
        body: JSON.stringify(filters),
        signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new IssueGroupRequestError(response.status, body);
      }
      if (response.body) await readIssueGroups(response.body, onGroup);
    },
    async loadGroup(filters, query, groupBy, entity, signal) {
      const groupFilters = filtersForIssueGroup(filters, groupBy, entity);
      if (!groupFilters) return { items: [], total: 0 };
      return load(groupFilters, query, signal);
    },
  };
};
