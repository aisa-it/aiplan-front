import { IProject } from 'src/interfaces/projects';
import { GROUP_BY_OPTIONS, PROJECT_VIEWS } from 'src/constants/constants';
import { PROJECT_EMOJI_OPTIONS } from 'src/constants/emojis';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const orderStateGroups = (unorderedStateGroups: any) =>
  Object.assign(
    { backlog: [], unstarted: [], started: [], completed: [], cancelled: [] },
    unorderedStateGroups,
  );

export const getStatesList = (stateGroups: any, onlyActive: boolean) => {
  const orderedStateGroups = orderStateGroups(stateGroups);
  return Object.keys(orderedStateGroups)
    .map((group) => [...orderedStateGroups[group].map((state: any) => state)])
    .flat()
    .filter(
      (state) =>
        (state.group !== 'cancelled' && state.group !== 'completed') ||
        !onlyActive,
    );
};

export const getStatesListIds = (stateGroups: any) => {
  const orderedStateGroups = orderStateGroups(stateGroups);
  return Object.keys(orderedStateGroups)
    .map((group) => [
      ...orderedStateGroups[group].map((state: any) => state.id),
    ])
    .flat();
};

export function groupByState(statesObj: any, arr: any[]) {
  const temp = arr.reduce((acc, elem) => {
    if (!statesObj[elem.state]) statesObj[elem.state] = [];
    statesObj[elem.state].push(elem);
    return statesObj;
  }, {});
  return Object.getOwnPropertyNames(temp).map((k) => temp[k]);
}

export function setStateLabel(state: string) {
  return GROUP_BY_OPTIONS.find((group) => {
    return group.value === state;
  });
}

export function setViewLabel(view: string) {
  return PROJECT_VIEWS.find((group) => {
    return group.value === view;
  });
}

export function projectReducer(projects: IProject[], identifier: string) {
  projects = projects.filter(
    (item) => item.identifier !== identifier && item.id !== identifier,
  );
  return projects;
}

export function getRandomEmoji(emojis: Array<string>) {
  const randomEmojiIndex = Math.floor(Math.random() * emojis.length);

  return emojis[randomEmojiIndex];
}

export function getProjectEmojiViaCode(code: string) {
  const emoji = PROJECT_EMOJI_OPTIONS.find((el: any) => el.value == code);

  return emoji ? emoji : code;
}

export function isPropertyHasMember(property: string) {
  return (
    property === 'Assignee to' ||
    property === 'Watchers' ||
    property === 'Created by'
  );
}

export function getActivityOffset(page: number, pageSize: number) {
  return ((page < 1 ? 1 : page) - 1) * pageSize;
}

export function setIntervalFunction(func: any, time = 5000) {
  return setInterval(async () => {
    await func();
  }, time);
}

export function buildFormData(
  data: any,
  files: Array<File> = [],
  dataKey: string,
  filesKey = 'files',
) {
  const formData = new FormData();
  formData.append(dataKey, JSON.stringify(data));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    formData.append(filesKey, file);
  }

  return formData;
}

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

export function getEmojiFromHexCode(code: string) {
  const codePoints = code.split(' ').map((c) => {
    const codeParseInt = parseInt(c.replace(/^U\+/, ''), 16);
    return isNaN(codeParseInt) || codeParseInt > 0x10ffff ? c : codeParseInt;
  });

  const isAllNumbers = codePoints.every(
    (c) => typeof c === 'number' && c <= 0x10ffff,
  );

  if (isAllNumbers) {
    return String.fromCodePoint(...(codePoints as number[]));
  } else {
    return code;
  }
}

export function getFullName(member?: DtoUserLight, type?: string) {
  if (!member) return 'Пользователь удалён';

  if (!member.is_onboarded && type === 'form')
    return member.last_name + ' ' + member.first_name;

  if (!member.is_onboarded) return member.email;

  return member.first_name + ' ' + member.last_name;
}

export function trimEmptyTags(htmlString?: string) {
  if (!htmlString) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  let firstChild = doc.body.firstChild;
  while (
    firstChild &&
    firstChild.nodeName === 'P' &&
    isElementEmpty(firstChild)
  ) {
    doc.body.removeChild(firstChild);
    firstChild = doc.body.firstChild;
  }

  let lastChild = doc.body.lastChild;
  while (lastChild && lastChild.nodeName === 'P' && isElementEmpty(lastChild)) {
    doc.body.removeChild(lastChild);
    lastChild = doc.body.lastChild;
  }

  return doc.body.innerHTML;
}

function isElementEmpty(el: Node): boolean {
  return el.textContent?.trim() === '' && el.childNodes.length === 0;
}

export function isDev(): boolean {
  return location.hostname == 'test.aiplan.aisa.ru';
}

export function isServerVersionNewer(serverAppVersion: string) {
  const currentAppVersion = localStorage.getItem('appVersion');
  if (!currentAppVersion) {
    return true;
  }

  const currentV = currentAppVersion.replace('v', '').split('.').map(Number);
  const serverV = serverAppVersion.replace('v', '').split('.').map(Number);

  for (let i = 0; i < Math.max(currentV.length, serverV.length); i++) {
    const current = currentV[i] || 0;
    const server = serverV[i] || 0;

    if (server > current) {
      return true;
    }
  }

  return false;
}

export function randomColorHex() {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
}

export const parseText = (html: string) => {
  if (!html) return;
  return html
    ?.replace(/&/g, '&amp;')
    ?.replace(/</g, '&lt;')
    ?.replace(/>/g, '&gt;');
};

export const escapeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// экранируем теги кроме <b></b>
export const parseBoldText = (html: string) => {
  return parseText(html)
    ?.replace(/&lt;b&gt;/gi, '<b>')
    ?.replace(/&lt;\/b&gt;/gi, '</b>');
};

export const isArraysEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const sorterArr1 = [...arr1].sort();
  const sorterArr2 = [...arr2].sort();

  return sorterArr1.every((value, index) => value === sorterArr2[index]);
};

export const hasObjectChanges = (
  original: Record<string, any>,
  current: Record<string, any>,
): boolean => {
  if (!original || !current) return false;

  return Object.keys(current).some((key) => {
    const val1 = current[key];
    const val2 = original[key];

    if (Array.isArray(val1) && Array.isArray(val2)) {
      return !isArraysEqual(val1, val2);
    }

    return val1 !== val2;
  });
};
