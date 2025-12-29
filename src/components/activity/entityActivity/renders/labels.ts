import { HistoryEntry } from '../types';
import { translateHistoryAction } from './actionTranslations';

export function renderLabels(m: HistoryEntry): string | undefined {
  if (m.verb === 'added') {
    return `${translateHistoryAction('labels', true)} ${m.new_value}`;
  }
  if (m.verb === 'removed') {
    return `${translateHistoryAction('labels', false)} ${m.old_value}`;
  }
  return undefined;
}

export function renderLabel(m: HistoryEntry): string | undefined {
  if (m.verb === 'added') {
    return `${translateHistoryAction('label', true)} ${m.new_value}`;
  }
  if (m.verb === 'removed') {
    return `${translateHistoryAction('label', false)} ${m.old_value}`;
  }
  return undefined;
}

