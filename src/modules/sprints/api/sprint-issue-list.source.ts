import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { createIssueListSource } from '@/modules/issues/api/issue-list.source';
import {
  filtersForIssueGroup,
  getEntityId,
  getIssueGroupKey,
  type IssueGroupEntity,
} from '@/modules/issues/model/issue-groups';
import type { SprintIssueListScope } from '@/modules/issues/model/issue-list.types';

// The server groups by this tuple. The representative state ID can vary.
const stateGroupKey = (state?: DtoStateLight | null) =>
  state?.project && state.name !== undefined
    ? JSON.stringify(['state', state.project, state.name, state.color ?? '', state.group ?? ''])
    : undefined;

export function createSprintIssueListSource(
  scope: SprintIssueListScope,
  getStates: () => ReadonlyMap<string, DtoStateLight>,
) {
  const [workspace, sprint] = [scope.workspaceSlug, scope.sprintId].map(encodeURIComponent);
  const resolveState = (entity: IssueGroupEntity) =>
    typeof entity === 'object' && entity
      ? entity as DtoStateLight
      : getStates().get(getEntityId(entity) ?? '');

  return createIssueListSource(
    `/api/auth/workspaces/${workspace}/sprints/${sprint}/issues/search/`,
    (filters, groupBy, entity) => {
      const key = groupBy === 'state' ? stateGroupKey(resolveState(entity)) : undefined;
      if (!key) return filtersForIssueGroup(filters, groupBy, entity);

      const states = new Set(
        [...getStates()].flatMap(([id, state]) => stateGroupKey(state) === key ? [id] : []),
      );
      const id = getEntityId(entity);
      if (id) states.add(id);
      const selected = filters.states?.length
        ? filters.states.filter((id) => states.has(id))
        : [...states];
      return selected.length ? { ...filters, states: selected } : null;
    },
    (groupBy, entity) =>
      (groupBy === 'state' ? stateGroupKey(resolveState(entity)) : undefined) ??
      getIssueGroupKey(groupBy, entity),
  );
}
