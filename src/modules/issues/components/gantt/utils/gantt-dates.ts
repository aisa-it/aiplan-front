import type { DtoIssueWithCount, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const DAY_MS = 86_400_000;
export const DAY_WIDTH = 40;

export function localGanttDay(date: Date) {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function timelineDate(day: number) {
  return new Date(day * DAY_MS);
}

function issueDay(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;

  // A date without a time already names the calendar day.
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? date.getTime() / DAY_MS
    : localGanttDay(date);
}

export function sprintGanttRange(sprint?: DtoSprint) {
  const start = issueDay(sprint?.start_date?.slice(0, 10));
  const end = issueDay(sprint?.end_date?.slice(0, 10));
  if (start === undefined || end === undefined || end < start) return;
  return { start, end: end + 1 };
}

export function ganttRange(
  issues: readonly DtoIssueWithCount[],
  today: number,
  sprintRange?: { start: number; end: number },
) {
  let start = Math.min(today, sprintRange?.start ?? today);
  let end = Math.max(today, sprintRange?.end ?? today);
  const now = Date.now();
  for (const issue of issues) {
    const bar = issueBar(issue, today, now);
    if (!bar) continue;
    start = Math.min(start, bar.start, bar.deadline ?? bar.start);
    end = Math.max(end, bar.end, bar.deadline ?? bar.end, bar.overdueEnd ?? bar.end);
  }
  return { start: start - 30, end: end + 30 };
}

export function issueBar(issue: DtoIssueWithCount, today: number, now = Date.now()) {
  const start = issueDay(issue.created_at);
  if (start === undefined) return undefined;

  const group = issue.state_detail?.group;
  if (group === 'cancelled') return { start, end: start + 4, group };

  const completion = issueDay(issue.completed_at);
  const target = issueDay(issue.target_date);
  const deadline = target === undefined ? undefined : target + 1;
  const targetTime = Date.parse(issue.target_date ?? '');
  const comparison = issue.completed_at ? Date.parse(issue.completed_at) : now;
  const overdue = deadline !== undefined && comparison > targetTime;
  const end = overdue ? deadline : (completion ?? today) + 1;

  return {
    start,
    end: Math.max(start + 1, end),
    group,
    deadline,
    overdue,
    overdueEnd: overdue ? (completion ?? today) + 1 : undefined,
  };
}
