import { defineStore } from 'pinia';
import { AiplanActivityTable } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getActivityDateOnWorkspace,
  getWorkspaceToken,
} from 'src/modules/workspace-settings/services/api';

interface SettingsStore {
  workspaceToken?: string;
  WorkspaceActivityMap: Record<string, AiplanActivityTable> | [];
}

export const useSettingsStore = defineStore('settings-store', {
  state: (): SettingsStore => {
    return {
      workspaceToken: '',
      WorkspaceActivityMap: [],
    };
  },

  actions: {
    async setActivityDateOnWorkspace(
      currentWorkspaceSlug: string,
      from: string,
      to: string,
    ) {
      await getActivityDateOnWorkspace(currentWorkspaceSlug, from, to).then(
        (data) => {
          this.WorkspaceActivityMap = data === null ? [] : data;
        },
      );
    },
    async setWorkspaceToken(workspaceSlug: string) {
      await getWorkspaceToken(workspaceSlug)
        .then((res) => (this.workspaceToken = res))
        .catch((err) => {
          throw new Error(err);
        });
    },
  },
});
