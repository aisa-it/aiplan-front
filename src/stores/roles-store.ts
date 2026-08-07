import { defineStore } from 'pinia';

import { defineRole, checkPermissionByWs } from '@/utils/permissions';
import type { DtoWorkspaceMemberWithOwner } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useRolesStore = defineStore('roles-store', {
  state: () => {
    return {
      roles: {
        workspace: '',
      },
    };
  },

  actions: {
    getWsNameRole(meInWs: DtoWorkspaceMemberWithOwner) {
      if (meInWs?.is_workspace_owner) return 'owner';
      return defineRole(meInWs?.role ?? 0);
    },

    setWorkspaceRole(meInWs: DtoWorkspaceMemberWithOwner) {
      this.roles.workspace = this.getWsNameRole(meInWs);
    },

    hasPermissionByWorkspace(
      meInWs: DtoWorkspaceMemberWithOwner,
      action: string,
    ) {
      const role = this.getWsNameRole(meInWs);
      return checkPermissionByWs(role, action);
    },
  },
});
