export function getUrlFile(id = '', url = '/api/auth/file/') {
  if (!id) return '';

  return url + id;
}
