import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';
import { translateHistoryAction } from './actionTranslations';

export function renderBlocks(m: HistoryEntry): string {
  if (m.old_value == null || m.old_value === '') {
    return `${translateHistoryAction('blocks', true)} ${aiplan.ru_field(m)} ${m.new_value}`;
  }
  if (m.new_value === '') {
    return `${translateHistoryAction('blocks', false)} ${aiplan.ru_field(m)} ${m.old_value}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

