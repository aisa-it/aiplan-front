import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getNextDayDateOnly,
  getEndDate,
  getEndDateType,
  getStatusClass,
} from './ganttDates';
import { getFullSprintDates } from 'src/modules/sprints/helpres';

/*
  Билдер списка задач для баров диаграммы

  Если есть спринт, то сначала вставляется бар спринта

  Если задача не имеет id, то ставится пустой бар,
  такие задачи появляются при отображении таблицы с группировкой,
  они нужны, чтобы сохранить связь между левой таблицей и диаграммой,
  чтобы задача в таблица шла на одном уровне с баром в диаграмме.
  По другому пробелов не добавить.

  Для обычных задач задается статус в название бара,
  кастомный класс статуса для нужного цвета бара
  начало бара начинается с даты создания задачи
  правила определения конца бара расписаны в getEndDate

  progress используется для нативного механизма frappe gantt,
  чтобы показывать заполненность бара, но для наших задач он не подходит,
  ставится 100, чтобы он был заполнен,
  а механизм прогресса выполнен через конечную дату в getEndDate
*/

export function buildGanttTasks(issues: DtoIssue[], sprint?: DtoSprint) {
  const result: any[] = [];

  if (sprint) {
    result.push({
      id: `sprint-${sprint.id}`,
      name: `${sprint.name} ${getFullSprintDates(sprint.start_date as string, sprint.end_date as string)}`,
      custom_class: 'sprint',
      start: sprint.start_date?.split('T')[0],
      end: getNextDayDateOnly(sprint.end_date as string),
      sprintStats: sprint.stats,
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

/*
  Если название статуса слишком маленькое, то иконка статуса уплывает из бара (становится левее бара),
  для этого добавляю неразрывных пробелов, если название меньше 7 символов
*/
const ZWSP = '\u00A0';

function padLabel(label: string, minLength = 7) {
  if (label.length >= minLength) return label;

  return label + ZWSP.repeat(minLength - label.length);
}
