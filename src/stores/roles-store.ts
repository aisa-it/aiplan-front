import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia';
import { useUserStore } from './user-store';

import { useWorkspaceStore } from './workspace-store';
import { defineRole, checkPermissionByWs } from '@/utils/permissions';
import type {
  DtoWorkspace,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useRolesStore = defineStore('roles-store', {
  state: () => {
    return {
      roles: {
        workspace: '',
      },
    };
  },

  actions: {
    getWsMembership(workspaceID: string) {
      // TODO: Архитектурный долг - Циклическая зависимость.
      // roles-store и workspace-store зависят друг от друга. Подумать над развязкой при рефакторинге.
      const { workspaceInfo, meInWorkspace } = storeToRefs(useWorkspaceStore());
      if (
        workspaceID === workspaceInfo?.value?.id ||
        workspaceID === workspaceInfo?.value?.slug
      )
        return meInWorkspace?.value;
      const userStore = useUserStore();
      return userStore.userWorkspacesMemberships[workspaceID];
    },

    getWsRole(workspaceID: string): number {
      return this.getWsMembership(workspaceID)?.role ?? 0;
    },

    getWsNameRole(meInWs: DtoWorkspaceMemberWithOwner) {
      if (meInWs?.is_workspace_owner) return 'owner';
      return defineRole(meInWs?.role ?? 0);
    },
    defineWorkspaceRole(meInWs: DtoWorkspaceMemberWithOwner) {
      return (this.roles.workspace = this.getWsNameRole(meInWs));
    },

    hasPermissionByWorkspace(ws: DtoWorkspace, action: string) {
      const role = this.getWsNameRole(this.getWsMembership(ws?.id ?? ''));
      return checkPermissionByWs(role, action);
    },
  },
});
