import { HistoryEntry } from '../types';
import { formatDate } from 'src/utils/time';
import { canBeConvertedToDate } from 'src/utils/canBeConvertedToDate';

export function renderCompletedAt(): string {
  return 'завершил(-а) задачу';
}

export function renderStartDate(): string {
  return 'начал(-а) выполнение задачи';
}

export function renderTargetDate(m: HistoryEntry): string | undefined {
  if (m.verb !== 'updated') {
    return undefined;
  }

  const newDate =
    m.new_value && canBeConvertedToDate(m.new_value)
      ? formatDate(m.new_value)
      : '';
  const oldDate =
    m.old_value && canBeConvertedToDate(m.old_value)
      ? formatDate(m.old_value.replace(/"/g, ''))
      : '';

  if (m.old_value === '<nil>' || !m.old_value) {
    return `установил(-а) срок исполнения ${newDate}`;
  } else if (m.new_value === '' && oldDate) {
    return `убрал(-а) срок исполнения ${oldDate}`;
  } else {
    return oldDate && newDate
      ? `изменил(-а) срок исполнения с ${oldDate} на ${newDate}`
      : 'изменил(-а) срок исполнения';
  }
}

