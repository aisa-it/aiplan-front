import Gantt from 'frappe-gantt';

export interface ICustomGanttTask extends Gantt.Task {
  status: string;
  parentId?: string;
}
