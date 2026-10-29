import type { ActivityVerb } from '../model/activity.types';

export default {
  verbs: {
    updated: 'обновил(-а)',
    removed: 'убрал(-а)',
    added: 'добавил(-а)',
    deleted: 'удалил(-а)',
    created: 'создал(-а)',
    move: 'перенес(-ла)',
    copied: 'скопировал(-а)',
    move_doc_to_workspace: 'перенес(-ла)',
    move_doc_to_doc: 'перенес(-ла)',
    move_workspace_to_doc: 'перенес(-ла)',
  } satisfies Record<ActivityVerb, string>,
  roles: { guest: 'Гость', member: 'Участник', admin: 'Администратор', forbid: 'Никто' },
  fallback: 'совершил(-а) необработанное действие {entity}, {field}, {verb}',
  root: { space: ' пространство ', spaceQuoted: ' пространство "{name}"' },
  form: {
    actions: { title: 'название в форме', description: 'описание в форме', end_date: 'дату окончания в форме', fields: 'поля в форме' },
    defaultTarget: 'форму',
    fallbackVerb: 'обновил(-а)',
  },
  // Ключ 'at' нельзя: PickupPaths из vue-i18n отбрасывает имена методов массивов (Array.prototype.at)
  workspaceRelations: { inside: 'в пространстве ', from: 'из пространства ', in: 'в пространство ', of: 'пространства ' },
  workspaceRelationsShort: { from: 'из пространства', of: 'пространства' },
  ui: { title: 'Активность', titleWithDate: 'Активность {date} г.', closeDay: 'Закрыть активности за выбранный день', noData: 'Нет данных', bot: 'Бот' },
};
