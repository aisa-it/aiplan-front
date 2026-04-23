import { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { HistoryEntry } from '../types';
import { valToRole } from 'src/utils/translator';

const userName = (u: DtoUser) => {
  if (!u) return '';
  const full = `${u.last_name ?? ''} ${u.first_name ?? ''}`.trim();
  return full || u.email || u.username || '';
};

export function renderEditor(m: HistoryEntry): string | undefined {
  const person =
        (m.new_value
          ? userName(m.new_entity_detail) || m.new_value
          : userName(m.old_entity_detail) || m.old_value) || '';

  if (m.verb === 'added') {
    return `<span>добавил(-а) право на редактирование документа пользователю ${person}<span/>`;
  }
  if (m.verb === 'removed' || m.verb === 'remove') {
    return `<span>удалил(-а) право на редактирование документа пользователю ${person}<span/>`;
  }
}

export function renderEditorRole(m: HistoryEntry): string {
  const oldRole = valToRole(+m.old_value)?.label ?? m.old_value;
  const newRole = valToRole(+m.new_value)?.label ?? m.new_value;
  return `<span>изменил(-а) роль редактирования документа с "${oldRole}" на "${newRole}"<span/>`;
}

