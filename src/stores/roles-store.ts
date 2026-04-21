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
  DtoProject,
  DtoProjectMemberWithLead,
  DtoWorkspace,
  DtoWorkspaceMemberWithOwner,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const userStore = useUserStore();

const { user, userWorkspacesMemberships, userProjectsMemberships } =
  storeToRefs(userStore);

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
    getWsMembership(workspaceID: string) {
      const { workspaceInfo, meInWorkspace } = storeToRefs(useWorkspaceStore());
      if (
        workspaceID === workspaceInfo?.value?.id ||
        workspaceID === workspaceInfo?.value?.slug
      )
        return meInWorkspace?.value;
      return userWorkspacesMemberships.value[workspaceID];
    },

    getWsRole(workspaceID: string): number {
      return this.getWsMembership(workspaceID)?.role ?? 0;
    },

    getWsNameRole(meInWs: DtoWorkspaceMemberWithOwner) {
      if (meInWs?.is_workspace_owner) return 'owner';
      return defineRole(meInWs?.role ?? 0);
    },

    // set types
    defineWorkspaceRole(meInWs: DtoWorkspaceMemberWithOwner) {
      return (this.roles.workspace = this.getWsNameRole(meInWs));
    },

    getProjectMembership(projectID: string) {
      const { project, meInProject } = storeToRefs(useProjectStore());
      if (projectID === project?.value?.id) return meInProject?.value;
      return userProjectsMemberships.value[projectID];
    },

    getProjectRole(projectID: string): number {
      return this.getProjectMembership(projectID)?.role ?? 0;
    },

    getProjectNameRole(meInProject: DtoProjectMemberWithLead) {
      if (meInProject?.is_project_lead) return 'owner';
      return defineRole(meInProject?.role ?? 0);
    },

    // set types
    defineProjectRole(meInProject: DtoProjectMemberWithLead) {
      return (this.roles.project = this.getProjectNameRole(meInProject));
    },

    getIssueNameRole(issue: DtoIssue): string {
      if (issue?.author_detail?.id === user.value.id) return 'author';

      const isAssignee = issue?.assignee_details?.find(
        (assignee) => assignee.id == user.value.id,
      );

      if (isAssignee) return 'assignee';

      return '';
    },

    // set types
    defineIssueRole(issueData: DtoIssue) {
      if (!user.value?.id) {
        return userStore.getUserInfo().then(() => {
          this.defineIssueRole(issueData);
        });
      }

      return (this.roles.issue = this.getIssueNameRole(issueData));
    },

    hasPermission(action: string) {
      if (!(this.roles.issue || this.roles.project || this.roles.workspace))
        return;

      return checkPermission(this.roles, action);
    },

    hasPermissionByWorkspace(ws: DtoWorkspace, action: string) {
      const role = this.getWsNameRole(this.getWsMembership(ws?.id ?? ''));
      return checkPermissionByWs(role, action);
    },

    hasPermissionByProject(project: DtoProject, action: string) {
      const role = this.getProjectNameRole(
        this.getProjectMembership(project?.id ?? ''),
      );
      return checkPermissionByProject(role, action);
    },

    hasPermissionByIssue(issue: DtoIssue, action: string) {

      const ws_role = this.getWsNameRole(
        this.getWsMembership(issue?.workspace ?? ''),
      );

      const project_role = this.getProjectNameRole(
        this.getProjectMembership(issue?.project ?? ''),
      );

      const issue_role = this.getIssueNameRole(issue);

      if (issue.name === 'екуц') {
        console.log('issue: ', issue)
        console.log(action)
        console.log('ws_role: ', ws_role)
        console.log('project_role: ', project_role)
        console.log('issue_role: ', issue_role)
      }
      return checkPermissionByIssue(ws_role, project_role, issue_role, action);
    },

    hasPermissionProjectMemberChange(member: any, memberToEdit: any) {
      if (
        member?.member_id === memberToEdit?.member_id ||
        memberToEdit?.member_id === memberToEdit.project?.project_lead
      )
        return false;

      if (this.roles.project === 'owner' || this.roles.project === 'admin')
        return true;
    },

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
