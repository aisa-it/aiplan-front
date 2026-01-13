import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';
import { translateHistoryAction } from './actionTranslations';

export function renderAssignees(m: HistoryEntry): string {
  if (m.old_value == null || m.old_value === '') {
    return `${translateHistoryAction('assignees', true)} ${aiplan.ru_field(m)} ${aiplan.UserName(m.new_entity_detail).join(' ')}`;
  }
  if (m.new_value === '') {
    return `${translateHistoryAction('assignees', false)} ${aiplan.ru_field(m)} ${aiplan.UserName(m.old_entity_detail).join(' ')}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

export function renderWatchers(m: HistoryEntry): string {
  if (m.old_value == null || m.old_value === '') {
    return `${translateHistoryAction('watchers', true)} ${aiplan.ru_field(m)} ${aiplan.UserName(m.new_entity_detail).join(' ')}`;
  }
  if (m.new_value === '') {
    return `${translateHistoryAction('watchers', false)} ${aiplan.ru_field(m)} ${aiplan.UserName(m.old_entity_detail).join(' ')}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

