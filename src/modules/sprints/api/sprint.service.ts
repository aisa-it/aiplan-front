import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useEventBus, type EventBusKey } from '@vueuse/core';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type { SprintIssueListScope } from '@/modules/issues/model/issue-list.types';

const sprintApi = new (withInterceptors(Sprint))();
export const sprintDeletedKey: EventBusKey<string> = Symbol('sprint-deleted');
const pendingSettings = new Map<string, Promise<void>>();
const keyFor = ({ workspaceSlug, sprintId }: SprintIssueListScope) =>
  JSON.stringify([workspaceSlug, sprintId]);

export const sprintService = {
  async list(workspaceSlug: string, signal?: AbortSignal) {
    const { data } = await sprintApi.getSprintList(workspaceSlug, { signal });
    return data ?? [];
  },

  async createFolder(workspaceSlug: string, name: string) {
    return (await sprintApi.addSprintFolders(workspaceSlug, { name })).data;
  },

  async renameFolder(workspaceSlug: string, folderId: string, name: string) {
    await sprintApi.updateSprintFolders(workspaceSlug, folderId, { name });
  },

  async deleteFolder(workspaceSlug: string, folderId: string) {
    await sprintApi.deleteSprintFolders(workspaceSlug, folderId);
  },

  async moveToFolder(workspaceSlug: string, sprintId: string, folderId: string) {
    await sprintApi.updateSprint(workspaceSlug, sprintId, { sprint_folder_id: folderId });
  },

  async delete(workspaceSlug: string, sprintId: string) {
    await sprintApi.deleteSprint(workspaceSlug, sprintId);
    useEventBus(sprintDeletedKey).emit(workspaceSlug);
  },

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
