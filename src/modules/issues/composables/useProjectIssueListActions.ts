import { issueService } from '../api/issue-service';
import type {
  IssueListActions,
  ProjectIssueListScope,
} from '../model/issue-list.types';
import { useRolesStore } from '@/stores/roles-store';
import { useProjectStore } from '@/stores/project-store';

export const useProjectIssueListActions = (
  scope: ProjectIssueListScope,
): IssueListActions => {
  const roleStore = useRolesStore();
  const projectStore = useProjectStore();

  return {
    canEdit(issue, field) {
      return roleStore.hasPermissionByIssue(
        issue,
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
