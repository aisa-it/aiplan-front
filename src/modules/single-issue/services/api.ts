import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { buildFormData, trimEmptyTags } from 'src/utils/helpers';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IssueProperties } from '@aisa-it/aiplan-api-ts/src/IssueProperties';
import {
  DtoIssueProperty,
  DtoSetIssuePropertyRequest,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const api = new (withInterceptors(Issues))();
const issuePropertiesApi = new (withInterceptors(IssueProperties))();

export const updateIssueInfo = async (
  workspaceSlug: string,
  projectID: string,
  issueID: string,
  data: DtoIssue,
  files: Array<File> = [],
) => {
  if (data.description_html !== '<p></p>') {
    data.description_html = trimEmptyTags(data.description_html);
  }

  const formData = buildFormData(data, files, 'issue');

  await api.updateIssue(workspaceSlug, projectID, issueID, formData);
};

export const issueSingleComment = async (
  workspaceSlug: string,
  projectId: string,
  issueIdOrSeq: string,
  commentId: string,
) => {
  return (
    await api.getIssueComment(workspaceSlug, projectId, issueIdOrSeq, commentId)
  ).data;
};

export const issueCommentUpdate = async (
  workspaceSlug: string,
  projectId: string,
  issueIdOrSeq: string,
  commentId: string,
  content: {
    html: string;
    files?: File[];
  },
  stripped: string,
  replyToCommentId?: string,
) => {
  const data = {
    comment_html: trimEmptyTags(content.html),
    comment_stripped: stripped,
    reply_to_comment_id: replyToCommentId,
  };

  const formData = buildFormData(data, content.files, 'comment');
  return await api.updateIssueComment(
    workspaceSlug,
    projectId,
    issueIdOrSeq,
    commentId,
    formData,
  );
};

export const issueCommentReply = async (
  workspaceSlug: string,
  projectId: string,
  issueId: string,
  content: any,
  stripped: string,
  replyCommentId: string,
) => {
  const data = {
    comment_html: trimEmptyTags(content.html),
    comment_stripped: stripped,
    reply_to_comment_id: replyCommentId,
  };

  const formData = buildFormData(data, content.files, 'comment');

  return await api.createIssueComment(
    workspaceSlug,
    projectId,
    issueId,
    formData,
  );
};

export type IssueProperty = DtoIssueProperty;

export const getIssueProperties = async (
  workspaceSlug: string,
  projectID: string,
  issueIdOrSeq: string,
) => {
  const response = await issuePropertiesApi.getIssueProperties(
    workspaceSlug,
    projectID,
    issueIdOrSeq,
  );
  return response.data;
};

export const updateIssueProperty = async (
  workspaceSlug: string,
  projectID: string,
  issueId: string,
  templateId: string,
  value: any,
) => {
  const request: DtoSetIssuePropertyRequest = { value };
  const response = await issuePropertiesApi.setIssueProperty(
    workspaceSlug,
    projectID,
    issueId,
    templateId,
    request,
  );
  return response.data;
};
