import type {
  DaoPaginationResponse,
  DtoIssueTemplate,
  DtoProjectMemberLight,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ProjectsStatesFlow } from '@aisa-it/aiplan-api-ts/src/ProjectsStatesFlow';
import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';

import { projectsApi } from '@/services/clients';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

import type { ProjectIssueListScope } from '../model/issue-list.types';

const statesFlowApi = new (withInterceptors(ProjectsStatesFlow))();
const sprintApi = new (withInterceptors(Sprint))();
const PAGE_SIZE = 100;

const loadAllOptions = async <T>(
  loadPage: (offset: number) => Promise<DaoPaginationResponse>,
) => {
  const items: T[] = [];
  while (true) {
    const { result = [], count } = await loadPage(items.length);
    if (!result.length) return items;

    items.push(...result);
    if (
      count === undefined ? result.length < PAGE_SIZE : items.length >= count
    ) {
      return items;
    }
  }
};

export const loadCreateIssueStatuses = async (
  { workspaceSlug, projectId }: ProjectIssueListScope,
  signal: AbortSignal,
) => {
  const [states, startStates] = await Promise.allSettled([
    projectsApi.getStateList(workspaceSlug, projectId, undefined, { signal }),
    statesFlowApi.getStartStates(workspaceSlug, projectId, { signal }),
  ]);
  const all: DtoStateLight[] =
    states.status === 'fulfilled'
      ? Object.values(states.value.data ?? {})
          .flat()
          .filter((state) => state.id)
      : [];
  const available =
    startStates.status === 'fulfilled' && Array.isArray(startStates.value.data)
      ? startStates.value.data.filter((state) => state.id)
      : [];

  if (!available.length) return all;
  if (states.status === 'rejected') return available;

  const availableIds = new Set(available.map((state) => state.id));
  return all.filter((state) => availableIds.has(state.id));
};

export const loadCreateIssueMembers = (
  { workspaceSlug, projectId }: ProjectIssueListScope,
  signal: AbortSignal,
) =>
  loadAllOptions<DtoProjectMemberLight>(async (offset) => {
    const { data } = await projectsApi.getProjectMemberList(
      workspaceSlug,
      projectId,
      { offset, limit: PAGE_SIZE, order_by: 'id', desc: false },
      { signal },
    );
    return data;
  });

export const searchCreateIssueMentionMembers = async (
  { workspaceSlug, projectId }: ProjectIssueListScope,
  search: string,
  signal: AbortSignal,
) => {
  const { data } = await projectsApi.getProjectMemberList(
    workspaceSlug,
    projectId,
    { offset: 0, limit: 4, search_query: search },
    { signal },
  );
  const members: DtoProjectMemberLight[] = data.result ?? [];
  return members.filter(
    (entry) => entry.member?.is_active && entry.member.username,
  );
};

export const loadCreateIssueTemplates = (
  { workspaceSlug, projectId }: ProjectIssueListScope,
  signal: AbortSignal,
) =>
  loadAllOptions<DtoIssueTemplate>(async (offset) => {
    const { data } = await projectsApi.getProjectIssueTemplates(
      workspaceSlug,
      projectId,
      { offset, limit: PAGE_SIZE },
      { signal },
    );
    return data;
  });

export const loadCreateIssueSprints = async (
  workspaceSlug: string,
  signal: AbortSignal,
) => {
  const { data } = await sprintApi.getSprintList(workspaceSlug, { signal });
  return (data ?? []).flatMap((folder) => folder.sprints ?? []);
};
