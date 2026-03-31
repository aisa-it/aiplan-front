import { defineStore } from 'pinia';
import { storeToRefs } from 'pinia';
import { useUserStore } from './user-store';
import { useWorkspaceStore } from './workspace-store';
import { useProjectStore } from './project-store';
import {
  defineRole,
  checkPermission,
  checkPermissionByWs,
  checkPermissionByProject,
  checkPermissionByIssue,
} from 'src/constants/roles';
import {
  DtoIssue,
  DtoProjectMember,
  DtoWorkspace,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const userStore = useUserStore();

const {
  user,
  userWorkspaces,
  userWorkspacesMemberships,
  userProjectsMemberships,
} = storeToRefs(userStore);
const { workspaceInfo, meInWorkspace } = storeToRefs(useWorkspaceStore());
const { project, meInProject } = storeToRefs(useProjectStore());

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

  actions: {
    getWsRole(workspaceID: string): number {
      if (
        workspaceID === workspaceInfo?.value?.id ||
        workspaceID === workspaceInfo?.value?.slug
      )
        return meInWorkspace?.value?.role ?? 0;
      return userWorkspacesMemberships.value[workspaceID]?.role ?? 0;
    },

    getWsNameRole(meInWs: DtoWorkspaceMember) {
      // if (currenWs?.owner_id === user.value?.id)
      //   return 'owner';
      return defineRole(meInWs.role ?? 0);
    },

    // set types
    defineWorkspaceRole(meInWs: DtoWorkspaceMember) {
      return (this.roles.workspace = this.getWsNameRole(meInWs));
    },

    getProjectRole(projectID: string): number {
      if (projectID === project?.value?.id)
        return meInProject?.value?.role ?? 0;
      return userProjectsMemberships.value[projectID]?.role ?? 0;
    },

    getProjectNameRole(meInProject: DtoProjectMember) {
      // if (project?.created_by === user.value.id)
      //   return (this.roles.project = 'owner');
      return defineRole(meInProject.role ?? 0);
    },

    // set types
    defineProjectRole(meInProject: DtoProjectMember) {
      return (this.roles.project = this.getProjectNameRole(meInProject));
    },

    // set types
    defineIssueRole(issueData: DtoIssue) {
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
      if (!(this.roles.issue || this.roles.project || this.roles.workspace))
        return;

      return checkPermission(this.roles, action);
    },

    // set types
    hasPermissionByWorkspace(ws: DtoWorkspace, action: string) {
      let role = '';

      if (ws.id === workspaceInfo?.value?.id && meInWorkspace?.value)
        role = this.getWsNameRole(meInWorkspace?.value);
      else
        role = this.getWsNameRole(
          userWorkspacesMemberships.value[ws?.id ?? ''],
        );

      return checkPermissionByWs(role, action);
    },

    // set types
    hasPermissionByProject(project: any, action: string) {
      let role = '';
      if (project.project_lead === user.value?.id) role = 'owner';
      else role = defineRole(project?.current_user_membership?.role);

      return checkPermissionByProject(role, action);
    },

    hasPermissionByIssue(issue: any, project: any, action: string) {
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
