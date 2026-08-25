export function parseCommentLink(href: string, title?: string) {
  try {
    const url = new URL(href, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length >= 6 && parts[1] === 'projects' && parts[3] === 'issues') {
      return {
        type: 'issue',
        slug: parts[0],
        projectIdentifier: parts[2],
        currentIssueId: parts[4],
        commentId: parts[5],
        ...(title && {
          title: title,
        }),
      };
    }

    if (parts.length >= 4 && parts[1] === 'aidoc') {
      return {
        type: 'aidoc',
        slug: parts[0],
        docId: parts[2],
        commentId: parts[3],
        ...(title && {
          title: title,
        }),
      };
    }
  } catch (e) {
    return null;
  }

  return null;
}

export function parseIssueLink(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);
    if (
      parts.length === 5 &&
      parts[1] === 'projects' &&
      parts[3] === 'issues'
    ) {
      return {
        slug: parts[0],
        projectIdentifier: parts[2],
        currentIssueId: parts[4],
        originalUrl: href,
      };
    }
    if (parts.length === 4 && parts[0] === 'i') {
      return {
        slug: parts[1],
        projectIdentifier: parts[2],
        currentIssueId: parts[3],
        originalUrl: href,
      };
    }
  } catch (e) {
    return null;
  }

  return null;
}

export function parseAttachmentLink(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts[0] !== 'api' && parts[1] !== 'auth' && parts[2] !== 'file')
      return null;

    const type = url.searchParams.get('type');
    const slug = url.searchParams.get('slug');
    const from = url.searchParams.get('from');
    const name = url.searchParams.get('name');

    if (!type || !slug || !from) return null;

    return {
      type,
      slug,
      title: name,
      originalUrl: url.origin + url.pathname,
      ...(type === 'aidoc' && { docId: from }),
      ...(type === 'issue' && {
        projectIdentifier: from.split('-')[0],
        currentIssueId: from.split('-')[1],
      }),
    };
  } catch (e) {
    return null;
  }
}

export function getIssueLink(
  workspaceSlug: string,
  projectIdentifier: string,
  issueId?: string,
) {
  return `${location.protocol}//${location.host}/${workspaceSlug}/projects/${projectIdentifier}/issues/${issueId}`;
}

export function getProjectLink(
  workspaceSlug: string,
  projectIdentifier: string,
) {
  return `${location.protocol}//${location.host}/${workspaceSlug}/projects/${projectIdentifier}`;
}

export function getDocumentLink(workspaceSlug: string, docId: string) {
  return `${location.protocol}//${location.host}/${workspaceSlug}/aidoc/${docId}`;
}

export function getSprintLink(workspaceSlug?: string, sprintId?: string) {
  if (!workspaceSlug || !sprintId) {
    return;
  }
  return `${location.protocol}//${location.host}/${workspaceSlug}/sprints/${sprintId}`;
}

/** Ссылка на якорь внутри текущего документа: `#введение`. */
export function isAnchorHref(href: string): boolean {
  return typeof href === 'string' && /^#\S+$/.test(href.trim());
}

/**
 * Разбирает ссылку с якорем.
 *
 * `#vvedenie`                        -> { anchorId }
 * `/ws-slug/aidoc/<docId>#vvedenie`  -> { slug, docId, anchorId }
 *
 * Ссылки на комментарий (`/ws/aidoc/<docId>/<commentId>`) сюда не попадают:
 * их по-прежнему разбирает parseCommentLink, который смотрит только pathname
 * и про хэш не знает вовсе.
 */
export function parseDocAnchorLink(href: string): {
  slug?: string;
  docId?: string;
  anchorId: string;
} | null {
  if (!href) return null;

  try {
    const url = new URL(href, window.location.origin);
    const anchorId = decodeURIComponent(url.hash.replace(/^#/, ''));
    if (!anchorId) return null;

    const parts = url.pathname.split('/').filter(Boolean);

    // Голый `#якорь` — цель в текущем документе, пути в ссылке нет.
    if (isAnchorHref(href.trim())) return { anchorId };

    if (parts.length === 3 && parts[1] === 'aidoc') {
      return { slug: parts[0], docId: parts[2], anchorId };
    }
  } catch (e) {
    return null;
  }

  return null;
}

/** Полная ссылка на якорь документа — то, что уходит в буфер обмена. */
export function getDocumentAnchorLink(
  workspaceSlug: string,
  docId: string,
  anchorId: string,
) {
  return `${getDocumentLink(workspaceSlug, docId)}#${encodeURIComponent(anchorId)}`;
}
