import { HistoryEntry } from '../types';
import { translateHistoryAction } from './actionTranslations';

export function renderDoc(m: HistoryEntry): string | undefined {
  if (m.verb === 'remove') {
    return `${translateHistoryAction('doc', false)} "${m.old_value}"`;
  }
  if (m.verb === 'added') {
    return `${translateHistoryAction('doc', true)} "${m.new_value}"`;
  }
  if (m.verb === 'created') {
    return `создал(-а) вложенный документ "${m.new_value}"`;
  }
  return undefined;
}

export function renderSeqId(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated') {
    return `изменил(-а) позицию документа в директории с ${+m.old_value! + 1} на ${+m.new_value! + 1}`;
  }
  if (m.verb === 'move') {
    if (m.new_value === m.workspace_detail?.name) {
      return 'перенес(-ла) документ в корневую директорию';
    } else {
      return `перенес(-ла) документ в директорию "${m.new_value}"`;
    }
  }
  return undefined;
}

export function renderDescription(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated') {
    return 'изменил(-а) описание';
  }
  if (m.entity_type === 'doc') {
    return 'изменил(-а) описание';
  }
  return undefined;
}

