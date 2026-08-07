
export function getUrlFile(id = '', url = '/api/auth/file/') {
  if (!id) return '';

  return url + id;
}

export function getFirstSymbol(value = '', isUpperCase = true) {
  if (!value) return '';

  if (typeof value !== 'string') {
    console.error('Ожидается строка, а передается ' + typeof value);
    return '';
  }

  if (!isUpperCase) return value.trim()[0].toLowerCase();

  return value.trim()[0].toUpperCase();
}
