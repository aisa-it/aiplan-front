import { defineStore } from 'pinia';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { allSprintColumns } from 'src/modules/issue-list/constants/sprintTableColumns';
import { SPRINT_GROUP_BY_OPTIONS } from 'src/constants/constants';
import { useWorkspaceStore } from 'src/stores/workspace-store';

const usersApi = new (withInterceptors(Users))();
const workspaceStore = useWorkspaceStore();

interface IProjectState {
  sprintProps: TypesViewProps | null;
  issuesLoader: boolean;
}

export const useSprintStore = defineStore('sprint-store', {
  state: (): IProjectState => {
    return {
      sprintProps: null,
      issuesLoader: false,
    };
  },

  getters: {
    isGroupingEnabled(): boolean | undefined {
      return (
        this.sprintProps?.filters?.group_by?.toLowerCase() !== 'none' || false
      );
    },

    isKanbanEnabled(): boolean | undefined {
      return this.sprintProps?.issueView === 'kanban';
    },

    getTableColumns() {
      return allSprintColumns.filter((column) => {
        if (column.name === 'sequence_id') return true;

        return this.sprintProps?.columns_to_show?.some(
          (c) => c === column?.name,
        );
      });
    },

    getStatusesAsArray() {
      const allStatesWs = workspaceStore.allWorkspaceStates;

      const result = Object.entries(allStatesWs ?? {}).reduce(
        (acc, [id, items]) => {
          items.forEach((item) => {
            const key = `${item.name}_${item.color}`;
            if (!acc[key]) {
              acc[key] = { name: item.name, color: item.color, id: [] };
            }
            acc[key].id.push(id);
          });
          return acc;
        },
        {},
      );

      return Object.values(result);
    },
  },

  actions: {
    async getMyViewProps() {
      return usersApi.getCurrentUser().then((res) => {
        const props = res.data.view_props;

        if (!props?.filters?.group_by) {
          props.filters.group_by = SPRINT_GROUP_BY_OPTIONS[0].value;
        }

        return (this.sprintProps = props ?? null);
      });
    },

    async setMyViewProps(props: TypesViewProps): Promise<void> {
      return usersApi.updateUserViewProps(props).then((res) => res.data);
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
        await this.setMyViewProps(props);
        this.sprintProps = props;
        return props;
      } catch (e) {}
    },
  },
});
