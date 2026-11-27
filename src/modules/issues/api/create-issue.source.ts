import type {
  AiplanIssueCreateRequest,
  DtoNewIssueID,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';

import { prepareEditorContentForSave } from '@/modules/editor';
import { httpClient } from '@/services/clients';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

import type { ProjectIssueListScope } from '../model/issue-list.types';

const sprintApi = new (withInterceptors(Sprint))();

export const createIssue = async (
  scope: ProjectIssueListScope,
  payload: AiplanIssueCreateRequest,
) => {
  const { html, files } = await prepareEditorContentForSave(
    payload.description_html ?? '',
  );
  const form = new FormData();
  form.append('issue', JSON.stringify({ ...payload, description_html: html }));
  files.forEach((file) => form.append('files', file));

  const workspaceSlug = encodeURIComponent(scope.workspaceSlug);
  const projectId = encodeURIComponent(scope.projectId);
  const { data } = await httpClient.post<DtoNewIssueID>(
    `/api/auth/workspaces/${workspaceSlug}/projects/${projectId}/issues/`,
    form,
  );
  return data.id;
};

export const addIssueToSprint = async (
  workspaceSlug: string,
  sprintId: string,
  issueId: string,
) => {
  await sprintApi.sprintIssuesUpdate(workspaceSlug, sprintId, {
    issues_add: [issueId],
  });
};
