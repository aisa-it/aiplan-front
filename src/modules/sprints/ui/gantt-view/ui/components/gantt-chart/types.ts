import { GanttBarObject } from '@infectoone/vue-ganttastic';

export interface IGanttRow {
  label: string;
  bars: GanttBarObject[];
}
