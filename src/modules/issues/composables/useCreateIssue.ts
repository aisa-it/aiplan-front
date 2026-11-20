import { ref } from 'vue';
import type { AiplanIssueCreateRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { uploadIssueAttachment } from '../api/create-issue-attachments.source';
import { addIssueToSprint, createIssue } from '../api/create-issue.source';
import type { ProjectIssueListScope } from '../model/issue-list.types';

export const useCreateIssue = () => {
  const isSaving = ref(false);
  const createdIssueId = ref<string>();
  let createdInWorkspace: string | undefined;
  let pendingAttachments: Parameters<typeof uploadIssueAttachment>[1][] = [];
  let pendingSprintIds: string[] = [];

  const save = async (
    scope: ProjectIssueListScope,
    payload: AiplanIssueCreateRequest,
    attachments: File[],
    sprintIds: string[],
  ) => {
    if (isSaving.value) return;
    isSaving.value = true;

    try {
      if (!createdIssueId.value) {
        const issueId = await createIssue(scope, payload);
        if (!issueId)
          throw new Error('The issue creation response did not include an ID');

        createdIssueId.value = issueId;
        createdInWorkspace = scope.workspaceSlug;
        pendingAttachments = attachments.map((file) => ({ file }));
        pendingSprintIds = [...new Set(sprintIds)];
      }

      const issueId = createdIssueId.value;
      const workspaceSlug = createdInWorkspace ?? scope.workspaceSlug;
      const failedAttachments: typeof pendingAttachments = [];
      for (const attachment of pendingAttachments) {
        try {
          await uploadIssueAttachment(issueId, attachment);
        } catch {
          failedAttachments.push(attachment);
        }
      }
      pendingAttachments = failedAttachments;

      const sprintResults = await Promise.allSettled(
        pendingSprintIds.map((sprintId) =>
          addIssueToSprint(workspaceSlug, sprintId, issueId),
        ),
      );
      pendingSprintIds = pendingSprintIds.filter(
        (_, index) => sprintResults[index]?.status === 'rejected',
      );

      return {
        issueId,
        complete: !pendingAttachments.length && !pendingSprintIds.length,
      };
    } finally {
      isSaving.value = false;
    }
  };

  return { isSaving, createdIssueId, save };
};
