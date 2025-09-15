import { Ref } from 'vue';

export function isEmpty(val: string, param: string) {
  return (val && val.length > 0) || `Необходимо ввести ${param}`;
}

export function isEmail(val: string) {
  const langEn = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(val);
  const langRu = /^[\wа-яА-ЯёЁ.-]+@[а-яА-ЯёЁ\d.-]+\.[а-яА-ЯёЁ]{2,}$/.test(val);
  return (val && val.length > 0 && (langEn || langRu)) || 'Некорректный email';
}

export function isUsername(val: string) {
  if (val && val.length > 0 && /^([A-Za-z0-9._\/\-\\])*$/.test(val) === false)
    return 'Имя пользователя может содержать буквы латинского алфавита и спец. символы: точка(.), нижнее подчеркивание(_), дефис (-), слэш прямой и обратный (/, \\), цифры (0-9)';

  if (val && val.length > 0 && /^([0-9._\/\-\\])*$/.test(val) === true)
    return 'Имя пользователя должно содержать минимум одну букву латинского алфавита';
  return true;
  // return (
  //   (val && val.length > 0 && /^([A-Za-z0-9._\/\-\\])*$/.test(val)) ||
  //   'Имя пользователя может содержать буквы латинского алфавита и спец. символы: точка(.), нижнее подчеркивание(_), дефис (-), слэш прямой и обратный (/, ), цифры (0-9)'
  // 'Имя пользователя может содержать буквы латинского алфавита, цифры и спец. символы (_-./\\)'
  // );
}

export function latinAndCyrillic(val: string, param: string) {
  return (
    (val.length > 0 && /^([а-яёА-ЯЁ\-]+|[a-zA-Z\-]+)$/i.test(val)) ||
    `${param} может содержать латинские или кириллические буквы и спец. символ дефис (-)`
  );
}

export function notDefisOnly(val: string, param: string) {
  return (
    (val.length > 0 && !/^([\-]+)$/i.test(val)) ||
    `${param} пользователя должно содержать минимум одну букву латинского или кириллического алфавита`
  );
}

export function isKebabCase(val: string, param: string) {
  // return (/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(val))
  return (
    /^[a-z0-9\-]+$/.test(val) ||
    `${param} может содержать латинские буквы в нижнем регистре, цифры и дефис (-)`
  );
}

export function isUpperCaseAndNumber(val: string, param: string) {
  return (
    /^[A-Z0-9]+$/.test(val) ||
    `${param} может содержать латинские буквы в верхнем регистре, цифры`
  );
}

export function maxLength(val: string, length = 50) {
  return val.length <= length || `Максимальный размер - ${length} символов`;
}

export function validateAllowedCharacters(val: string, param: string) {
  const reg =
    /^[A-Za-zА-Яа-яёЁ0-9 ._\/\-\\!#\$%&'\"\(\)\*\+,\-.:;№<=>?@\[\\\]\^_\{\|\}~]+$/;
  return (
    reg.test(val) ||
    `${param} может содержать латинские и кириллические буквы, цифры и спец. символы`
  );
}

export function isValidURL(val: string) {
  const regURL =
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/((localhost|(\d{1,3}\.){3}\d{1,3}|\[[a-fA-F0-9:]+\]|[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9]{1,63})?|xn--[a-zA-Z0-9]{1,59}))(:\d+)?(\/[\wа-яА-ЯёЁ0-9()@:%_\+.~#?&\/=\-\u0400-\u04FF]*)?$/u;
  return regURL.test(val);
}

export function validateField(
  val: string,
  validations: Array<string | boolean>,
  fieldState: Ref,
): boolean | string {
  fieldState.value = false;

  for (const validation of validations) {
    if (typeof validation === 'string') {
      return validation;
    }
  }

  fieldState.value = true;
  return true;
}

export function isValidFileSize(file: File, maxSize: number) {
  return file.size / 1024 / 1024 <= maxSize;
}

export function isValidDate(val: string): boolean | string {
  if (!val) return 'Выберите или введите дату';

  const message = 'Введите дату в формате ДД.ММ.ГГГГ';

  const formatRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = val.match(formatRegex);

  if (!match) return message;

  // Проверка существования даты
  const [day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}`);

  if (
    date.getFullYear() !== +year ||
    date.getMonth() + 1 !== +month ||
    date.getDate() !== +day
  ) {
    return message;
  }

  return true;
}

export function isDateNotInPast(val: string): boolean | string {
  if (!isValidDate(val)) return isValidDate(val);

  const [day, month, year] = val.split('.');
  const date = new Date(+year, +month - 1, +day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return date >= now || 'Дата не может быть в прошлом';
}

export function isTimeNotInPast(time: string, date: string): boolean {
  const [day, month, year] = date.split('.');
  const inputDate = new Date(Number(year), Number(month) - 1, Number(day));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate.getTime() !== today.getTime()) return true;

  const [hours, minutes] = time.split(':').map(Number);
  const inputTime = new Date();
  inputTime.setHours(hours, minutes, 0, 0);

  const now = new Date();

  return inputTime.getTime() > now.getTime();
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
