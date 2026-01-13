import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';

export function renderComment(m: HistoryEntry): string {
  if (m.verb === 'created') {
    return `добавил(-а) ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

