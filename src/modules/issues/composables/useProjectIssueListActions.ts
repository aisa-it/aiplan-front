import { issueService } from '../api/issue-service';
import type {
  IssueListActions,
  ProjectIssueListScope,
} from '../model/issue-list.types';
import { useProjectStore } from '@/stores/project-store';
import { useUserStore } from '@/stores/user-store';
import { checkPermissionByIssue } from '@/utils/permissions';

export const useProjectIssueListActions = (
  scope: ProjectIssueListScope,
): IssueListActions => {
  const userStore = useUserStore();
  const projectStore = useProjectStore();

  return {
    canEdit(issue, field) {
      let issueRole = '';

      const isAssignee = issue?.assignee_details?.some(
        (assignee) => assignee.id === userStore.user?.id,
      );
      if (isAssignee) issueRole = 'assignee';

      if (issue?.author_detail?.id === userStore.user?.id) issueRole = 'author';

      return checkPermissionByIssue(
        userStore.workspaceRoleName,
        userStore.projectRoleName,
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
    updateViewSettings(settings) {
      return projectStore.updateViewSettings(
        scope.workspaceSlug,
        scope.projectId,
        settings,
      );
    },
  };
};
