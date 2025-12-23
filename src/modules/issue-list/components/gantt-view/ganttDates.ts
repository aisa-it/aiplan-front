import {
  DtoIssue,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getNextDayDateOnly(dateString: string, days = 1): string {
  const [y, m, d] = dateString.split('T')[0].split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function isOverdue(task: DtoIssue): boolean {
  if (!task.target_date || task.state_detail?.group === 'cancelled')
    return false;
  const target = new Date(task.target_date);
  const compare = task.completed_at ? new Date(task.completed_at) : new Date();
  return compare > target;
}

export function getEndDateType(task: DtoIssue) {
  if (task.state_detail?.group === 'cancelled') return 'cancelled';
  if (isOverdue(task)) return 'overdue';
  if (task.completed_at) return 'completed';
  return 'now';
}

export function getEndDate(task: DtoIssue, type: string): string {
  switch (type) {
    case 'cancelled':
      return task.created_at ?? '';
    case 'completed':
      return task.completed_at ?? '';
    case 'overdue':
      return task.target_date ?? '';
    default:
      return new Date().toISOString();
  }
}

export function getStatusClass(status?: DtoStateLight | null) {
  if (!status) return '';
  switch (status.group) {
    case 'unstarted':
    case 'backlog':
      return 'status-open';
    case 'started':
      return 'status-in-progress';
    case 'completed':
      return 'status-done';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return '';
  }
}
