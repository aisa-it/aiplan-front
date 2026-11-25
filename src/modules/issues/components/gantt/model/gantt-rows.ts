import type { InjectionKey, VNode } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface GanttRow {
  key: number;
  issue: DtoIssueWithCount;
  centerY: number;
}

export type GanttRowProps = (row: { item: DtoIssueWithCount }) => {
  onVnodeMounted(vnode: VNode): void;
  onVnodeUpdated(vnode: VNode): void;
  onVnodeUnmounted(vnode: VNode): void;
};

export const ganttLayoutKey: InjectionKey<{
  rowProps: GanttRowProps;
  layoutChanged(): void;
}> = Symbol('gantt-layout');
