import { defineStore } from 'pinia';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import {
  DtoSprint,
  TypesIssuesListFilters,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { allSprintColumns } from 'src/modules/issue-list/constants/sprintTableColumns';
import { SPRINT_GROUP_BY_OPTIONS } from 'src/constants/constants';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { IQuery } from 'src/stores/issues-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { sprintUpdate, getSprint, updateSprintView } from '../services/api';

const usersApi = new (withInterceptors(Users))();
const workspaceStore = useWorkspaceStore();

const aiplan = useAiplanStore();
const api = aiplan.api;

export enum NotUpdated {
  SprintPage = 1,
  Nav,
}

export const useSprintStore = defineStore('sprint-store', {
  state: () => {
    return {
      sprint: {} as DtoSprint,
      sprintProps: null,
      issuesLoader: false,
      refreshSprintData: false,
      notUpdated: [] as NotUpdated[],
    };
  },

  getters: {
    isGroupingEnabled(): boolean | undefined {
      return (
        this.sprintProps?.filters?.group_by?.toLowerCase() !== 'none' || false
      );
    },

    isGanttDiagramm(): boolean | undefined {
      return this.sprintProps?.issueView === 'gantt_chart';
    },

    isKanbanEnabled(): boolean | undefined {
      return this.sprintProps?.issueView === 'kanban';
    },

    getTableColumns() {
      const order: string[] =
        this.sprintProps?.columns_to_show ?? ([] as string[]);

      const sequenceColumn = allSprintColumns.find(
        (c) => c.name === 'sequence_id',
      );

      const orderedColumns = order
        .map((name) => allSprintColumns.find((c) => c.name === name))
        .filter(Boolean);

      return [sequenceColumn, ...orderedColumns].filter(Boolean);
    },

    sortAllColumns() {
      const orderedColumns = this.getTableColumns;
      const inactive = allSprintColumns.filter(
        (c) => !orderedColumns?.some((el) => el.name === c.name),
      );

      return [...orderedColumns, ...inactive];
    },

    getStatusesAsArray() {
      const result =
        this.sprint?.issues?.reduce((acc, issue) => {
          const st = issue.state_detail;
          if (!st) return acc;

          const key = `${st.name}_${st.color}`;

          if (!acc[key]) {
            acc[key] = { name: st.name, color: st.color, id: [] };
          }

          acc[key].id.push(st.id);

          return acc;
        }, {}) ?? [];

      return Object.values(result);
    },
  },

  actions: {
    triggerSprintRefresh(notUpdated?: NotUpdated) {
      if (notUpdated) {
        this.notUpdated.push(notUpdated);
      }
      this.refreshSprintData = true;
    },
    clearSprintRefresh() {
      this.notUpdated = [] as NotUpdated[];
      this.refreshSprintData = false;
    },

    async getMyViewProps(workspaceSlug: string, sprintId: string) {
      if (!workspaceSlug || !sprintId) return '';
      return getSprint(workspaceSlug, sprintId).then((res) => {
        const props = res.view_props;

        if (!props?.filters?.group_by) {
          props.filters.group_by = SPRINT_GROUP_BY_OPTIONS[0].value;
        }

        return (this.sprintProps = props ?? null);
      });
    },

    async setMyViewProps(
      workspaceSlug: string,
      sprintId: string,
      props: TypesViewProps,
    ): Promise<string> {
      if (!workspaceSlug || !sprintId) return '';
      return updateSprintView(workspaceSlug, sprintId, props).then(
        (res) => res,
      );
    },

    isGroupHide(groupId: string): boolean {
      if (
        this.sprintProps?.group_tables_hide &&
        this.sprintProps?.group_tables_hide[groupId]
      )
        return Boolean(this.sprintProps?.group_tables_hide[groupId]);
      else return false;
    },

    async setGroupHide(groupToHide: string, hideValue: boolean) {
      const props = JSON.parse(JSON.stringify(this.sprintProps));

      if (!props.group_tables_hide) props.group_tables_hide = {};

      props.group_tables_hide[groupToHide] = !hideValue;
      try {
        await this.setMyViewProps(
          this.router.currentRoute.value.params.workspace as string,
          this.router.currentRoute.value.params.sprint as string,
          props,
        );
        this.sprintProps = props;
        return props;
      } catch (e) {}
    },

    async getIssueList(
      wsSlug: string,
      sprintSlug: string,
      filters?: TypesIssuesListFilters,
      query?: IQuery,
    ) {
      return api.post(
        `/api/auth/workspaces/${wsSlug}/sprints/${sprintSlug}/issues/search/`,
        { ...filters },
        { params: query },
      );
    },
  },
});
