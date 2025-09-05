interface ActionTranslations {
  [key: string]: {
    [key: string]: string;
  };
}

export const ACTION_TRANSLATIONS: ActionTranslations = {
  labels: {
    1: 'добавил(-а) новый тег',
    0: 'убрал(-а) тег',
  },
  priority: {
    1: 'установил(-а) приоритет',
    0: 'убрал(-а) приоритет',
  },
  blocking: {
    1: 'установил(-а), что задача ',
    0: 'убрал(-а), что задача  ',
  },
  blocks: {
    1: 'установил(-а) блокировщик',
    0: 'убрал(-а) блокировщик',
  },
  target_date: {
    1: 'установил(-а) срок исполнения',
    0: 'убрал(-а) срок исполнения',
  },
  parent: {
    1: 'добавил(-а) родительскую задачу ',
    0: 'убрал(-а) родителя',
  },
  sub_issue: {
    1: 'добавил(-а) подзадачу ',
    0: 'убрал(-а) подзадачу',
  },
  linked: {
    1: 'добавил(-а) связанную задачу ',
    0: 'убрал(-а) связанную задачу ',
  },
  watchers: {
    1: 'добавил(-а) наблюдателя ',
    0: 'убрал(-а) наблюдателя',
  },
  assignees: {
    1: 'добавил(-а) исполнителя ',
    0: 'убрал(-а) исполнителя',
  },
  default_assignees: {
    1: 'добавил(-а) в проект ',
    0: 'убрал(-а) из проекта',
  },
  default_watchers: {
    1: 'добавил(-а) в проект ',
    0: 'убрал(-а) из проекта',
  },
  default: {
    1: 'добавил(-а) ',
    0: 'убрал(-а)',
  },
};

export function translateAction(type: string, field: boolean) {
  const actions = ACTION_TRANSLATIONS[type];
  const key: number = field ? 1 : 0;

  return actions[key];
}
