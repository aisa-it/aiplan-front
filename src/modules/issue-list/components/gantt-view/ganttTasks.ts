import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getNextDayDateOnly,
  getEndDate,
  getEndDateType,
  getStatusClass,
} from './ganttDates';
import { getFullSprintDates } from 'src/modules/sprints/helpres';

export function buildGanttTasks(issues: DtoIssue[], sprint?: DtoSprint) {
  const result: any[] = [];

  if (sprint) {
    result.push({
      id: `sprint-${sprint.id}`,
      name: `${sprint.name} ${getFullSprintDates(sprint.start_date as string, sprint.end_date as string)}`,
      custom_class: 'sprint',
      start: sprint.start_date?.split('T')[0],
      end: getNextDayDateOnly(sprint.end_date as string),
      progress: 100,
      readonly: true,
    });
  }

  result.push(
    ...issues.map((task) => {
      const type = getEndDateType(task);
      if (!task.id)
        return {
          name: '',
          start: new Date(),
          end: new Date(),
          progress: 100,
          custom_class: 'empty',
        };
      const offset = type === 'cancelled' ? 4 : 1;
      return {
        ...task,
        id: task.id,
        name: padLabel(task.state_detail?.name ?? 'Без статуса'),
        custom_class: getStatusClass(task.state_detail),
        start: task.created_at?.split('T')[0],
        end: getNextDayDateOnly(getEndDate(task, type), offset),
        progress: 100,
        typeEndDate: type,
      };
    }),
  );

  return result;
}

const ZWSP = '\u00A0';

function padLabel(label: string, minLength = 7) {
  if (label.length >= minLength) return label;

  return label + ZWSP.repeat(minLength - label.length);
}
