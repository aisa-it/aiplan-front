import { HistoryEntry } from '../types';
import { translateHistoryAction } from './actionTranslations';

export function renderSprint(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated') {
    return `изменил(-а) спринт с "${m.old_value}" на "${m.new_value}"`;
  }
  if (m.verb === 'added') {
    return `${translateHistoryAction('sprint', true)} "${m.new_value}"`;
  }
  if (m.verb === 'removed') {
    return `${translateHistoryAction('sprint', false)} "${m.old_value}"`;
  }
  return undefined;
}
