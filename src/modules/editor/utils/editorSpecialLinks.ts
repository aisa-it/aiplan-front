import type { EditorSpecialLink } from '../model/editor.types';

export const ISSUE_LINK_NODE = 'issueLinkMention';
export const COMMENT_LINK_NODE = 'commentLinkMention';
export const ATTACHMENT_LINK_NODE = 'attachmentLinkMention';

export interface ParsedEditorSpecialLink {
  nodeName:
    | typeof ISSUE_LINK_NODE
    | typeof COMMENT_LINK_NODE
    | typeof ATTACHMENT_LINK_NODE;
  attributes: Record<string, string>;
}

const getUrl = (value: string) => {
  try {
    const url = new URL(value, location.origin);

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url
      : undefined;
  } catch {
    return undefined;
  }
};

export const getSafeEditorLinkHref = (value?: string) =>
  value && getUrl(value) ? value : undefined;

export const getEditorCommentContextHref = (link?: EditorSpecialLink) => {
  if (!link?.workspaceSlug) return undefined;
  const workspace = encodeURIComponent(link.workspaceSlug);
  if (link.contextType === 'aidoc' && link.documentId) {
    return `/${workspace}/aidoc/${encodeURIComponent(link.documentId)}`;
  }
  if (link.contextType === 'issue' && link.projectIdentifier && link.issueId) {
    return `/${workspace}/projects/${encodeURIComponent(link.projectIdentifier)}/issues/${encodeURIComponent(link.issueId)}`;
  }
  return undefined;
};

export const getEditorCommentFailure = (reason: unknown, originalUrl?: string) => {
  const error = reason && typeof reason === 'object'
    ? reason as { status?: number; response?: { status?: number } }
    : undefined;
  const notFound = (error?.status ?? error?.response?.status) === 404;
  return {
    notFound,
    fallbackHref: notFound ? getSafeEditorLinkHref(originalUrl) : undefined,
  };
};

const parseCommentLink = (
  url: URL,
  originalUrl: string,
): ParsedEditorSpecialLink | undefined => {
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length >= 6 && parts[1] === 'projects' && parts[3] === 'issues') {
    return {
      nodeName: COMMENT_LINK_NODE,
      attributes: {
        type: 'issue',
        slug: parts[0],
        projectIdentifier: parts[2],
        currentIssueId: parts[4],
        commentId: parts[5],
        originalUrl,
      },
    };
  }

  if (parts.length >= 4 && parts[1] === 'aidoc') {
    return {
      nodeName: COMMENT_LINK_NODE,
      attributes: {
        type: 'aidoc',
        slug: parts[0],
        docId: parts[2],
        commentId: parts[3],
        originalUrl,
      },
    };
  }
};

const parseIssueLink = (
  url: URL,
  originalUrl: string,
): ParsedEditorSpecialLink | undefined => {
  const parts = url.pathname.split('/').filter(Boolean);
  const isFullLink =
    parts.length === 5 &&
    parts[1] === 'projects' &&
    parts[3] === 'issues';
  const isShortLink = parts.length === 4 && parts[0] === 'i';
  if (!isFullLink && !isShortLink) return;

  const [slug, projectIdentifier, currentIssueId] = isShortLink
    ? [parts[1], parts[2], parts[3]]
    : [parts[0], parts[2], parts[4]];

  return {
    nodeName: ISSUE_LINK_NODE,
    attributes: {
      slug,
      projectIdentifier,
      currentIssueId,
      originalUrl,
    },
  };
};

const parseAttachmentLink = (
  url: URL,
): ParsedEditorSpecialLink | undefined => {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'api' || parts[1] !== 'auth' || parts[2] !== 'file') return;

  const type = url.searchParams.get('type');
  const slug = url.searchParams.get('slug');
  const source = url.searchParams.get('from');
  if ((type !== 'issue' && type !== 'aidoc') || !slug || !source) return;

  const attributes: Record<string, string> = {
    type,
    slug,
    originalUrl: `${url.origin}${url.pathname}`,
    title: url.searchParams.get('name') || 'Вложение',
  };

  if (type === 'aidoc') {
    attributes.docId = source;
  } else {
    const separatorIndex = source.indexOf('-');
    if (separatorIndex === -1) return;

    attributes.projectIdentifier = source.slice(0, separatorIndex);
    attributes.currentIssueId = source.slice(separatorIndex + 1);
  }

  return {
    nodeName: ATTACHMENT_LINK_NODE,
    attributes,
  };
};

export const parseEditorSpecialLink = (
  value: string,
): ParsedEditorSpecialLink | undefined => {
  const originalUrl = value.trim();
  const url = getUrl(originalUrl);
  if (!url || url.username || url.password) return;

  return (
    parseCommentLink(url, originalUrl) ??
    parseIssueLink(url, originalUrl) ??
    parseAttachmentLink(url)
  );
};

export const getEditorSpecialLinkFromElement = (
  element: HTMLElement,
): EditorSpecialLink | undefined => {
  const { dataset, classList } = element;
  const contextType: EditorSpecialLink['contextType'] =
    dataset.type === 'issue' || dataset.type === 'aidoc'
      ? dataset.type
      : undefined;
  const common = {
    contextType,
    workspaceSlug: dataset.slug,
    projectIdentifier: dataset.projectIdentifier,
    issueId: dataset.currentIssueId,
    commentId: dataset.commentId,
    documentId: dataset.docId,
    originalUrl: dataset.originalUrl,
    title: dataset.title,
  };

  if (classList.contains('attachment-link')) {
    return { kind: 'attachment', ...common };
  }

  if (classList.contains('comment-link')) {
    return { kind: 'comment', ...common };
  }

  if (classList.contains('issue-link')) {
    return { kind: 'issue', ...common };
  }
};
