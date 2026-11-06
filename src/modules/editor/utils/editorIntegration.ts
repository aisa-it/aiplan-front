import { Docs } from '@aisa-it/aiplan-api-ts/src/Docs';
import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import type {
  DtoDocComment,
  DtoIssueComment,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import type {
  EditorAttachmentLinkPreview,
  EditorIssueLinkPreview,
  EditorMember,
  EditorMentionItem,
  EditorSpecialLink,
} from '../model/editor.types';

const docsApi = new Docs({ withCredentials: true });
const issuesApi = new Issues({ withCredentials: true });
const projectsApi = new Projects({ withCredentials: true });
const workspaceApi = new Workspace({ withCredentials: true });

export const toEditorMentionItem = (
  entry: EditorMember,
): EditorMentionItem | undefined => {
  const user = entry.member;
  if (!user?.id || !user.username || !user.is_active) return;
  return { ...user, id: user.id, username: user.username };
};

export const toEditorMentionItems = (members: EditorMember[] = []) =>
  members
    .map(toEditorMentionItem)
    .filter((item): item is EditorMentionItem => !!item);

export const searchEditorMembers = async (
  workspaceSlug: string,
  query: string,
  projectIdentifier?: string,
): Promise<EditorMentionItem[]> => {
  const response = projectIdentifier
    ? await projectsApi.getProjectMemberList(workspaceSlug, projectIdentifier, {
        offset: 0,
        limit: 4,
        search_query: query,
      })
    : await workspaceApi.getWorkspaceMemberList(workspaceSlug, {
        offset: 0,
        limit: 4,
        order_by: 'id',
        desc: false,
        search_query: query,
      });
  return toEditorMentionItems(response.data.result ?? []);
};

const fetchEditorMentionMembers = async (
  workspaceSlug: string,
  projectIdentifier?: string,
): Promise<EditorMentionItem[]> => {
  const limit = 100;
  const members: EditorMentionItem[] = [];

  for (let offset = 0; ; offset += limit) {
    const response = projectIdentifier
      ? await projectsApi.getProjectMemberList(
          workspaceSlug,
          projectIdentifier,
          {
            offset,
            limit,
          },
        )
      : await workspaceApi.getWorkspaceMemberList(workspaceSlug, {
          offset,
          limit,
        });
    const page = response.data.result ?? [];

    for (const entry of page) {
      const user = entry.member;
      if (user?.id && user.username) {
        members.push({ ...user, id: user.id, username: user.username });
      }
    }

    if (
      page.length < limit ||
      (response.data.count !== undefined &&
        offset + page.length >= response.data.count)
    )
      break;
  }

  return members;
};

const mentionMemberLists = new Map<
  string,
  {
    until: number;
    request: Promise<EditorMentionItem[]>;
  }
>();

export const loadEditorMentionMembers = (
  workspaceSlug: string,
  projectIdentifier?: string,
): Promise<EditorMentionItem[]> => {
  const key = `${workspaceSlug}\u0000${projectIdentifier ?? ''}`;
  const cached = mentionMemberLists.get(key);
  if (cached && cached.until > Date.now()) return cached.request;

  const request = fetchEditorMentionMembers(workspaceSlug, projectIdentifier);
  mentionMemberLists.set(key, { until: Date.now() + 120_000, request });
  void request.catch(() => {
    if (mentionMemberLists.get(key)?.request === request) {
      mentionMemberLists.delete(key);
    }
  });
  return request;
};

export const resolveEditorIssueLink = async (
  link: EditorSpecialLink,
): Promise<EditorIssueLinkPreview | undefined> => {
  if (!link.workspaceSlug || !link.projectIdentifier || !link.issueId) return;
  const { data } = await issuesApi.getIssue(
    link.workspaceSlug,
    link.projectIdentifier,
    link.issueId,
  );
  return {
    identifier: [data.project_detail?.identifier, data.sequence_id]
      .filter((part) => part != null)
      .join('-'),
    name: data.name,
    statusName: data.state_detail?.name,
    statusColor: data.state_detail?.color,
  };
};

export const resolveEditorAttachmentLink = async (
  link: EditorSpecialLink,
): Promise<EditorAttachmentLinkPreview | undefined> => {
  if (link.contextType === 'issue') {
    return {
      sourceTitle: [link.projectIdentifier, link.issueId]
        .filter(Boolean)
        .join('-'),
    };
  }
  if (link.contextType !== 'aidoc' || !link.workspaceSlug || !link.documentId)
    return;
  const { data } = await docsApi.getDoc(link.workspaceSlug, link.documentId);
  return { sourceTitle: data.title };
};

export const resolveEditorCommentLink = async (
  link: EditorSpecialLink,
): Promise<DtoDocComment | DtoIssueComment | undefined> => {
  if (!link.workspaceSlug || !link.commentId) return;
  if (link.contextType === 'aidoc' && link.documentId) {
    const { data } = await docsApi.getDocComment(
      link.workspaceSlug,
      link.documentId,
      link.commentId,
    );
    return data;
  }
  if (link.contextType === 'issue' && link.projectIdentifier && link.issueId) {
    const { data } = await issuesApi.getIssueComment(
      link.workspaceSlug,
      link.projectIdentifier,
      link.issueId,
      link.commentId,
    );
    return data;
  }
};

export const downloadEditorAttachment = async (link: EditorSpecialLink) => {
  if (!link.originalUrl) return false;
  const url = new URL(link.originalUrl, window.location.origin);
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    !url.pathname.startsWith('/api/auth/file/')
  ) {
    return false;
  }
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok)
    throw new Error(`Не удалось скачать вложение: ${response.status}`);
  const objectUrl = URL.createObjectURL(await response.blob());
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = link.title || 'Вложение';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
  return true;
};
