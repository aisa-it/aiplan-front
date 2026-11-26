import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type { SprintIssueListScope } from '@/modules/issues/model/issue-list.types';

const sprintApi = new (withInterceptors(Sprint))();
const pendingSettings = new Map<string, Promise<void>>();
const keyFor = ({ workspaceSlug, sprintId }: SprintIssueListScope) =>
  JSON.stringify([workspaceSlug, sprintId]);

export const sprintService = {
  async get(scope: SprintIssueListScope, signal: AbortSignal) {
    await pendingSettings.get(keyFor(scope))?.catch(() => {});
    signal.throwIfAborted();
    return (await sprintApi.getSprint(scope.workspaceSlug, scope.sprintId, { signal })).data;
  },

  async getStates(scope: SprintIssueListScope, signal: AbortSignal) {
    const { data } = await sprintApi.getSprintStates(scope.workspaceSlug, scope.sprintId, { signal });
    return data ?? [];
  },

  async saveView(scope: SprintIssueListScope, settings: TypesViewProps) {
    const key = keyFor(scope);
    const previous = pendingSettings.get(key) ?? Promise.resolve();
    const request = previous.catch(() => {}).then(async () => {
      await sprintApi.updateSprintView(scope.workspaceSlug, scope.sprintId, settings);
    });
    pendingSettings.set(key, request);
    try {
      await request;
    } finally {
      if (pendingSettings.get(key) === request) pendingSettings.delete(key);
    }
  },
};
