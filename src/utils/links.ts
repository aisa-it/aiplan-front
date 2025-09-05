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
        ...title && {
          title: title
        }
      };
    }

    if (parts.length >= 4 && parts[1] === 'aidoc') {
      return {
        type: 'aidoc',
        slug: parts[0],
        docId: parts[2],
        commentId: parts[3],
        ...title && {
          title: title
        }
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
    if (parts.length === 5 && parts[1] === 'projects' && parts[3] === 'issues') {
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

export function getIssueLink(workspaceSlug: string, projectIdentifier: string, issueId?: string) {
  return `${location.protocol}//${location.host}/${workspaceSlug}/projects/${projectIdentifier}/issues/${issueId}`
}

export function getProjectLink(workspaceSlug: string, projectIdentifier: string) {
  return `${location.protocol}//${location.host}/${workspaceSlug}/projects/${projectIdentifier}/issues`
}
