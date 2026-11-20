import type {
  DtoIssueSearchResult,
  DtoLabelLight,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { httpClient, projectsApi } from '@/services/clients';

const PARENT_PAGE_SIZE = 25;

export const searchIssueParents = async (
  workspaceSlug: string,
  projectId: string,
  search: string,
  authorId: string | undefined,
  offset: number,
  signal: AbortSignal,
) => {
  const filters: TypesIssuesListFilters = {
    search_query: search,
    only_active: false,
    authors: authorId ? [authorId] : [],
  };
  const { data } = await httpClient.post<DtoIssueSearchResult>(
    `/api/auth/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}/issues/search`,
    filters,
    {
      params: {
        offset,
        limit: PARENT_PAGE_SIZE,
        order_by: 'sequence_id',
        desc: true,
      },
      signal,
    },
  );
  const issues = data.issues ?? [];
  const end = offset + issues.length;
  const hasMore =
    issues.length > 0 &&
    (data.count != null ? end < data.count : issues.length === PARENT_PAGE_SIZE);

  return { issues, nextOffset: hasMore ? end : undefined };
};

export const loadCreateIssueTags = async (
  workspaceSlug: string,
  projectId: string,
  search: string,
  signal: AbortSignal,
) => {
  const { data } = await projectsApi.getIssueLabelList(
    workspaceSlug,
    projectId,
    { search_query: search || undefined },
    { signal },
  );
  return data;
};

export const createIssueTag = async (
  workspaceSlug: string,
  projectId: string,
  tag: Required<Pick<DtoLabelLight, 'name' | 'color'>>,
) => {
  const { data } = await projectsApi.createIssueLabel(
    workspaceSlug,
    projectId,
    tag,
  );
  return data;
};
