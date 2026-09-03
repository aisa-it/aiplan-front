import { useProjectStore } from '@/stores/project-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';
import { useUserStore } from '@/stores/user-store';
import { checkPermissionByIssue, defineRole } from '@/utils/permissions';
import { issueService } from '../api/issue-service';
import type {
  IssueListActions,
  ProjectIssueListScope,
} from '../model/issue-list.types';

export const useProjectIssueListActions = (
  scope: ProjectIssueListScope,
): IssueListActions => {
  const projectStore = useProjectStore();
  const workspacesStore = useWorkspacesStore();
  const userStore = useUserStore();

  return {
    canEdit(issue, field) {
      const userId = userStore.user?.id;
      const membership = projectStore.meInProject;
      if (
        !userId ||
        !issue.id ||
        issue.project !== scope.projectId ||
        projectStore.project?.id !== scope.projectId ||
        !membership
      )
        return false;

      const workspace = workspacesStore.workspaces.find(
        (item) => item.slug === scope.workspaceSlug,
      );
      const workspaceRole =
        workspace?.owner_id === userId || workspace?.owner?.id === userId
          ? 'owner'
          : defineRole(workspace?.current_user_membership?.role ?? 0);
      const projectRole = membership.is_project_lead
        ? 'lead'
        : defineRole(membership.role ?? 0);
      let issueRole = '';
      if ((membership.role ?? 0) >= 10) {
        if (issue.author_detail?.id === userId) issueRole = 'author';
        else if (issue.assignee_details?.some((user) => user.id === userId))
          issueRole = 'assignee';
      }

      return checkPermissionByIssue(
        workspaceRole,
        projectRole,
        issueRole,
        field === 'state' ? 'change-issue-status' : 'change-issue-primary',
      );
    },
    update(issue, patch) {
      if (!issue.id) throw new Error('Issue ID is required');
      return issueService.update(
        scope.workspaceSlug,
        scope.projectId,
        issue.id,
        patch,
      );
    },
    getAvailableStates(issue) {
      if (!issue.id) throw new Error('Issue ID is required');
      return issueService.getAvailableStates(
        scope.workspaceSlug,
        scope.projectId,
        issue.id,
      );
    },
  };
};
