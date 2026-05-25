import { defineStore } from 'pinia';
import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const workspaceApi = new (withInterceptors(Workspace))();

interface RootStore {
  workspace?: DtoWorkspace;
}
export const useWorkspaceStoreV2 = defineStore('workspace-storev2', {
  state: (): RootStore => {
    return {
      workspace: undefined,
    };
  },

  actions: {
    async getWorkspaceInfo(workspaceSLug: string) {
      const response = await workspaceApi.getWorkspace(workspaceSLug);

      this.workspace = response.data;
      return response.data;
    },
  },
});
