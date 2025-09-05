import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { useUserStore } from './user-store';
import {
  defineRole,
  checkPermission,
  checkPermissionByWs,
  checkPermissionByProject,
  checkPermissionByIssue,
} from 'src/constants/roles';

const api = useAiplanStore();

const userStore = useUserStore();

const { user, userWorkspaces } = storeToRefs(userStore);

export const useRolesStore = defineStore('roles-store', {
  state: () => {
    return {
      roles: {
        workspace: '',
        project: '',
        issue: '',
      },
    };
  },

  getters: {
    isOwnerProject() {
      return api.me?.id === api.currentProject?.created_by;
    },
  },

  actions: {
    // set types
    defineWorkspaceRole(currenWs: any) {
      if (currenWs?.owner_id === user.value?.id)
        return (this.roles.workspace = 'owner');

      this.roles.workspace = defineRole(
        currenWs?.current_user_membership?.role,
      );
    },
    // set types
    defineProjectRole(project: any) {
      if (project?.created_by === user.value.id)
        return (this.roles.project = 'owner');

      this.roles.project = defineRole(project?.current_user_membership?.role);
    },
    // set types
    defineIssueRole(issueData: any) {
      if (!user.value?.id) {
        return userStore.getUserInfo().then(() => {
          this.defineIssueRole(issueData);
        });
      }
      if (issueData?.author_detail?.id === user.value?.id)
        return (this.roles.issue = 'author');

      if (
        issueData?.assignee_details?.find(
          (assignee) => assignee.id == user.value?.id,
        )
      )
        this.roles.issue = 'assignee';
      else this.roles.issue = '';
    },

    hasPermission(action: string) {
      // if (user.value.is_superuser) return true;

      if (!(this.roles.issue || this.roles.project || this.roles.workspace))
        return;

      return checkPermission(this.roles, action);
    },
    // set types
    hasPermissionByWorkspace(ws: any, action: string) {
      let role = '';

      // if (user.value?.is_superuser) return true;
      // if (user.value?.is_superuser && action === 'ws-settings') return true;
      if (ws?.owner_id === user.value?.id) role = 'owner';
      else role = defineRole(ws?.current_user_membership?.role);

      return checkPermissionByWs(role, action);
    },
    hasPermissionByFavoriteWorkspace(ws: any, allws: any, action: string) {
      let role = '';

      // if (user.value?.is_superuser) return true;

      if (ws?.owner_id === user.value?.id) role = 'owner';
      const currentInAllWs = allws.find((el: any) => el.id === ws?.id);
      role = defineRole(currentInAllWs?.current_user_membership?.role);

      return checkPermissionByWs(role, action);
    },
    // set types
    hasPermissionByProject(project: any, action: string) {
      let role = '';
      // if (user.value?.is_superuser) return true;

      // if (!project?.current_user_membership) return false;
      if (project.project_lead === user.value?.id) role = 'owner';
      else role = defineRole(project?.current_user_membership?.role);

      return checkPermissionByProject(role, action);
    },
    hasPermissionByIssue(issue: any, project: any, action: string) {
      // if (user.value.is_superuser) return true;

      const ws = userWorkspaces.value.find(
        (ws) => ws.slug === issue.workspace_detail?.slug,
      );
      const ws_role = defineRole(ws?.current_user_membership?.role);

      const project_role = defineRole(project?.current_user_membership?.role);

      let issue_role = '';

      if (
        (ws_role === 'guest' && project_role === 'guest') ||
        project_role === 'guest'
      )
        return false;

      if (
        issue?.assignee_details?.find(
          (assignee) => assignee.id == user.value.id,
        )
      )
        issue_role = 'assignee';

      if (issue?.author_detail?.id === user.value.id) issue_role = 'author';
      return checkPermissionByIssue(ws_role, project_role, issue_role, action);
    },
    // set types
    hasPermissionProjectMemberChange(member: any, memberToEdit: any) {
      if (
        member?.member_id === memberToEdit?.member_id ||
        memberToEdit?.member_id === memberToEdit.project?.project_lead
      )
        return false;

      // if (user.value.is_superuser) return true;

      if (this.roles.project === 'owner' || this.roles.project === 'admin')
        return true;
    },
    // set types
    hasPermissionWsMemberChange(member: any, memberToEdit: any, ws: any) {
      if (
        member?.id === memberToEdit?.member_id ||
        memberToEdit?.member_id === ws?.owner?.id
      )
        return false;

      if (user.value?.is_superuser || user.value?.is_staff) return true;

      if (this.roles.workspace === 'owner' || this.roles.workspace === 'admin')
        return true;
    },
  },
});
