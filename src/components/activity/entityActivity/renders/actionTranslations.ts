interface ActionTranslation {
  add: string;
  remove: string;
}

export const HISTORY_ACTIONS: Record<string, ActionTranslation> = {
  blocks: {
    add: 'добавил(-а)',
    remove: 'удалил(-а)',
  },
  assignees: {
    add: 'добавил(-а)',
    remove: 'убрал(-а)',
  },
  watchers: {
    add: 'добавил(-а)',
    remove: 'убрал(-а)',
  },
  labels: {
    add: 'добавил(-а) тег',
    remove: 'удалил(-а) тег',
  },
  label: {
    add: 'добавил(-а) тег',
    remove: 'удалил(-а) тег',
  },
  linked: {
    add: 'добавил(-а) связь с задачей',
    remove: 'убрал(-а) связь с задачей',
  },
  sub_issue: {
    add: 'добавил(-а) подзадачу',
    remove: 'удалил(-а) подзадачу',
  },
  parent: {
    add: 'добавил(-а)',
    remove: 'удалил(-а)',
  },
  blocking: {
    add: 'заблокировал(-а) задачу',
    remove: 'снял(-а)',
  },
  link: {
    add: 'добавил(-а) ссылку',
    remove: 'удалил(-а) ссылку',
  },
  attachment: {
    add: 'добавил(-а)',
    remove: 'удалил(-а)',
  },
  doc: {
    add: 'добавил(-а) вложенный документ',
    remove: 'убрал(-а) вложенный документ',
  },
  sprint: {
    add: 'добавил(-а) спринт',
    remove: 'убрал(-а) спринт',
  },
};

export function translateHistoryAction(field: string, isAdd: boolean): string {
  const actions = HISTORY_ACTIONS[field] || HISTORY_ACTIONS.blocks;
  return isAdd ? actions.add : actions.remove;
}
