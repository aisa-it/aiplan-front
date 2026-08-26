import { defineStore } from 'pinia';

import {
  defineRole,
  checkPermissionByWs,
  checkPermissionByProject,
} from '@/utils/permissions';
import type {
  DtoProjectMemberWithLead,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useRolesStore = defineStore('roles-store', {
  state: () => {
    return {
      roles: {
        workspace: '',
        project: '',
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

    getProjectNameRole(meInProject: DtoProjectMemberWithLead) {
      if (meInProject.is_project_lead) return 'lead';
      return defineRole(meInProject.role ?? 0);
    },

    setProjectRole(meInProject: DtoProjectMemberWithLead) {
      this.roles.project = this.getProjectNameRole(meInProject);
    },

    hasPermissionByProject(
      meInProject: DtoProjectMemberWithLead,
      action: string,
    ) {
      const role = this.getProjectNameRole(meInProject);
      return checkPermissionByProject(role, action);
    },
  },
});
