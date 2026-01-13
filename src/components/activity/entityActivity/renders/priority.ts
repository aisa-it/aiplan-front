import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';

export function renderPriority(m: HistoryEntry): string {
  if (m.verb === 'updated' && m.old_value === '<nil>') {
    return `установил(-а) ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

export function renderDefault(m: HistoryEntry): string {
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

