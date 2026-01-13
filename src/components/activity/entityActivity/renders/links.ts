import { HistoryEntry } from '../types';
import { translateHistoryAction } from './actionTranslations';

export function renderLinked(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated' && !m.new_value && m.old_value) {
    return `${translateHistoryAction('linked', false)} ${m.old_value}`;
  }
  if (m.verb === 'updated' && !m.old_value && m.new_value) {
    return `${translateHistoryAction('linked', true)} ${m.new_value}`;
  }
  return undefined;
}

export function renderLink(m: HistoryEntry): string | undefined {
  if (m.verb === 'created' && !m.old_value && m.new_value) {
    return `${translateHistoryAction('link', true)} "${m.new_entity_detail?.title || m.new_value}"`;
  }
  if (m.verb === 'deleted' && m.old_value) {
    return `${translateHistoryAction('link', false)} "${m.old_entity_detail?.title || m.old_value}"`;
  }
  return undefined;
}

export function renderLinkUrl(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated' && m.new_value) {
    return `изменил(-а) ссылку c"${m.old_value}" на "${m.new_value}"`;
  }
  return undefined;
}

export function renderLinkTitle(m: HistoryEntry): string {
  return `изменил(-а) название ссылки с "${m.old_value}" на "${m.new_value}"`;
}

