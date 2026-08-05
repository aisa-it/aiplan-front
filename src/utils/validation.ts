export function isEmail(val: string) {
  const langEn = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val);
  const langRu = /^[\wа-яА-ЯёЁ.-]+@[а-яА-ЯёЁ\d.-]+\.[а-яА-ЯёЁ]{2,}$/.test(val);
  return (val && val.length > 0 && (langEn || langRu)) || 'Некорректный email';
}

export function isValidURL(val: string) {
  const regURL =
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/((localhost|(\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\]|[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9]{1,63})?|xn--[a-zA-Z0-9]{1,59}))(:\d+)?(\/[\wа-яА-ЯёЁ0-9()@:%_\+.~#?&\/=\-\u0400-\u04FF]*)?$/u;
  return regURL.test(val);
}

export function allowedNotFoundServices(url: string): boolean {
  const allowedPaths = [
    '/api/auth/workspaces/:workspace/doc/:docId/comments/:commentId',
    '/api/auth/workspaces/:workspace/projects/:projectId/issues/:issueId/comments/:commentId',
  ];

  function matchUrl(path: string, url: string): boolean {
    const pathParts = path.split('/').filter(Boolean);
    const urlParts = url.split('/').filter(Boolean);
    if (pathParts.length !== urlParts.length) return false;

    return pathParts.every(
      (part, i) => part.startsWith(':') || part === urlParts[i],
    );
  }

  return allowedPaths.some((path) => matchUrl(path, url));
}
