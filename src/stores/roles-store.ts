import { defineStore } from 'pinia';

import {
  defineRole,
  checkPermissionByWs,
  checkPermissionByProject,
  checkPermissionByIssue,
} from '@/utils/permissions';
import type {
  DtoIssue,
  DtoProjectMemberWithLead,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useUserStore } from './user-store';

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

    getIssueNameRole(issue: DtoIssue) {
      if (!this.roles.project || this.roles.project === 'guest') return '';

      const userStore = useUserStore();

      if (issue?.author_detail?.id === userStore.user?.id) return 'author';

      const isAssignee = issue?.assignee_details?.some(
        (assignee) => assignee.id === userStore.user?.id,
      );

      if (isAssignee) return 'assignee';

      return '';
    },

    hasPermissionByIssue(issue: DtoIssue, action: string) {
      const issue_role = this.getIssueNameRole(issue);

      return checkPermissionByIssue(
        this.roles.workspace,
        this.roles.project,
        issue_role,
        action,
      );
    },
  },
});
