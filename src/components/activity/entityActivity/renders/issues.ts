import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';
import { translateHistoryAction } from './actionTranslations';

export function renderParent(m: HistoryEntry): string {
  if (m.old_value == null || m.old_value === '') {
    return `${aiplan.UserName(m.target_user).join(' ')} ${translateHistoryAction('parent', true)} ${aiplan.ru_field(m)} ${m.new_value}`;
  }
  if (m.new_value === '') {
    return `${aiplan.UserName(m.target_user).join(' ')} ${translateHistoryAction('parent', false)} ${aiplan.ru_field(m)} ${m.old_value}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

export function renderBlocking(m: HistoryEntry): string {
  if (m.old_value == null || m.old_value === '') {
    return `${aiplan.UserName(m.target_user).join(' ')} ${translateHistoryAction('blocking', true)} ${m.new_value}`;
  }
  if (m.new_value === '') {
    return `${aiplan.UserName(m.target_user).join(' ')} ${translateHistoryAction('blocking', false)} ${aiplan.ru_field(m)} с задачи ${m.old_value}`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
}

export function renderSubIssue(m: HistoryEntry): string | undefined {
  if (m.verb === 'added') {
    return `${translateHistoryAction('sub_issue', true)} ${m.new_value}`;
  }
  if (m.verb === 'removed') {
    return `${translateHistoryAction('sub_issue', false)} ${m.old_value}`;
  }
  return undefined;
}
