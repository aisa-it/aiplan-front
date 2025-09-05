import { translatePrioritets } from './translator';
import { formatDate } from 'src/utils/time';

export default class aioplan {
  static UserName(u: any) {
    if (u) {
      const n = [
        u?.last_name,
        u?.first_name,
        u?.is_active === false ? '(Заблокирован)' : '',
      ].filter((e) => e && e.trim().length > 0);
      return n.length > 0 ? n : [u.email];
    } else {
      return [''];
    }
  }

  static rufield = {
    comment: { txt: 'комментарий', prefix: '', suffix: '' },
    name: { txt: 'название', prefix: '', suffix: '' },
    state: { txt: 'статус', prefix: 'с', suffix: 'на' },
    link: { txt: 'ссылку', prefix: '', suffix: '' },
    labels: { txt: 'теги', prefix: '', suffix: '' },
    assignees: { txt: 'исполнителя', prefix: 'с', suffix: 'на' },
    watchers: { txt: 'наблюдателя', prefix: 'с', suffix: 'на' },
    attachment: { txt: 'вложениe', prefix: '', suffix: '' },
    target_date: { txt: 'срок исполнения', prefix: 'с', suffix: 'на' },
    description: { txt: 'описание', prefix: '', suffix: '' },
    parent: { txt: 'родителя', prefix: 'с', suffix: 'на' },
    blocking: { txt: 'блокировку', prefix: '', suffix: '' },
    blocks: {
      txt: ' блокирующую задачу',
      prefix: ', что эта задача',
      suffix: '',
    },
    priority: { txt: 'приоритет', prefix: 'с', suffix: 'на' },
    title: { txt: 'название', prefix: '', suffix: '' },
    comment_comment_html: { txt: 'комментарий', prefix: '', suffix: '' },
  };

  static ruverb = {
    created: 'создал(-а)',
    deleted: 'удалил(-а)',
    updated: 'изменил(-а)',
  };

  static ru_verb(m: any) {
    return this.ruverb[m.verb] || m.verb;
  }

  static ru_field(m: any) {
    if (!!!m.field) return 'задачу';

    return this.rufield[m.field] ? `${this.rufield[m.field].txt}` : m.field;
  }

  static ru_value(m: any) {
    switch (m.field) {
      case 'blocks':
        return `${this.rufield[m.field].prefix} "${m.old_value}"
          ${this.rufield[m.field].suffix} "${m.new_value}"`;
      case 'state':
        return `${this.rufield[m.field].prefix} "${m.old_value}"
            ${this.rufield[m.field].suffix} "${m.new_value}"`;

      case 'priority':
        if (m.old_value === '<nil>' || !m.old_value)
          return `${this.rufield[m.field].suffix}
                  "${
                    translatePrioritets(m.new_value).charAt(0).toUpperCase() +
                    translatePrioritets(m.new_value).slice(1).toLowerCase()
                  }"`;
        if (m.new_value === '')
          return `${this.rufield[m.field].suffix} "Без приоритета"`;

        return `${this.rufield[m.field].prefix}
                "${
                  translatePrioritets(m.old_value)?.charAt(0)?.toUpperCase() +
                  translatePrioritets(m.old_value)?.slice(1)?.toLowerCase()
                }"
                ${this.rufield[m.field].suffix}
                "${
                  translatePrioritets(m.new_value)?.charAt(0).toUpperCase() +
                  translatePrioritets(m.new_value)?.slice(1).toLowerCase()
                }"`;

      case 'target_date':
        if (m.old_value === '<nil>' || !m.old_value) {
          const newDate = formatDate(m.new_value);
          return `${this.rufield[m.field].suffix} ${newDate}`;
        } else if (m.new_value === '') {
          return `${this.rufield[m.field].suffix} "без даты"`;
        } else {
          const oldDate = formatDate(m.old_value.replace(/"/g, ''));
          const newDate = formatDate(m.new_value);
          return `${this.rufield[m.field].prefix} ${oldDate}
            ${this.rufield[m.field].suffix} ${newDate}`;
        }
      case 'assignees':
      case 'watchers':
      case 'parent':
        return `${this.rufield[m.field].prefix} ${m.old_value} ${
          this.rufield[m.field].suffix
        } ${m.new_value}`;

      default:
        return '';
    }
  }
}
