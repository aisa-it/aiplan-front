import { api } from 'src/stores/aiplan-store';
import { API_WORKSPACES_PREFIX } from 'src/constants/apiPrefix';

export const getSubIssues = async (
  workspaceSlug: string,
  projectID: string,
  issueid: string,
  manualSort?: boolean,
) => {
  return await api.get(
    `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueid}/sub-issues/`,
    {
      params: { manual_sort: manualSort },
    },
  );
};

export const updateSubIssues = async (
  workspaceSlug: string,
  projectId: string,
  issueId: string,
  subIssueIds: string[],
) => {
  if (!workspaceSlug) return;

  return api.post(
    `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectId}/issues/${issueId}/sub-issues`,
    { sub_issue_ids: subIssueIds },
  );
};

export const moveSubIssueUp = async (
  workspaceSlug: string,
  projectID: string,
  issueID: string,
  subIssueId: string,
) => {
  return api.post(
    `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/sub-issues/${subIssueId}/up`,
  );
};

export const moveSubIssueDown = async (
  workspaceSlug: string,
  projectID: string,
  issueID: string,
  subIssueId: string,
) => {
  return api.post(
    `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/sub-issues/${subIssueId}/down`,
  );
};

export const getAvailableSubIssues = async (
  workspaceSlug: string,
  projectID: string,
  issueID: string,
  params: any,
) => {
  return api.get(
    `${API_WORKSPACES_PREFIX}/${workspaceSlug}/projects/${projectID}/issues/${issueID}/sub-issues/available/`,
    { params: params },
  );
};
