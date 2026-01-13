import { HistoryEntry } from '../types';
import aiplan from 'src/utils/aiplan';
import { translateHistoryAction } from './actionTranslations';

export function renderAttachment(m: HistoryEntry): string {
  if (m.verb === 'created') {
    return `${translateHistoryAction('attachment', true)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)} "${m.new_entity_detail?.asset.name || m.new_value}"`;
  }
  return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(m)} "${m.old_value}"`;
}

