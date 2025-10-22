import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { IProjectView } from 'src/interfaces/projects';
import { useUserStore } from './user-store';
import { useProjectStore } from './project-store';
import { allColumns } from 'src/modules/issue-list/constants/tableColumns';

const userStore = useUserStore();
const aiplanStore = useAiplanStore();
const projectStore = useProjectStore();

export const useViewPropsStore = defineStore('view_props', {
  state: () => {
    return {
      projectView: true,
      props: {
        filters: {
          group_by: 'None',
          order_by: 'id',
          orderDesc: true,
          states: [],
          workspaces: [],
          projects: [],
          assigned_to_me: false,
          authored_by_me: false,
          watched_by_me: false,
        },
        issueView: 'list',
        showEmptyGroups: true,
        showSubIssues: true,
        draft: true,
        showOnlyActive: false,
        group_tables_hide: {},
        columns_to_show: [],
        activeTab: 'assigned_to_me',
        page_size: 25,
      },
    };
  },
  actions: {
    async getProps() {
      if (this.projectView) {
        this.props = await aiplanStore.getMyProjectViewProps();
      } else {
        const info = userStore.user;
        this.props = info.view_props;
      }
      if (!this.props?.page_size && this.props) {
        this.props.page_size = 25;
        this.props.issueView = this.props.issueView
          ? this.props.issueView
          : 'list';
        this.props.filters.group_by = this.props.filters.group_by
          ? this.props.filters.group_by
          : 'None';
        this.saveProps();
      }
      return this.props;
    },
    async getProjectProps() {
      this.props = projectStore.meInProject?.view_props;
      this.props = this.props.page_size
        ? this.props
        : {
            filters: {
              group_by: 'None',
              order_by: 'id',
              orderDesc: true,
              states: [],
              workspaces: [],
              projects: [],
            },
            issueView: 'list',
            showEmptyGroups: true,
            showSubIssues: true,
            draft: false,
            showOnlyActive: false,
            group_tables_hide: {},
            columns_to_show: [],
            activeTab: 'assigned_to_me',
            page_size: 25,
          };
      return;
    },
    saveProps() {
      if (this.projectView) {
        return aiplanStore.setProjectView(this.props as IProjectView);
      } else {
        return aiplanStore.setMyViewProps(this.props as IProjectView);
      }
    },
    isGroupHide(groupId: string) {
      if (!this.props) return false;

      if (!this.props?.group_tables_hide) {
        console.log(this.props);
        this.props['group_tables_hide'] = {};
        return false;
      }

      let prefix = '';
      if (groupId)
        prefix =
          this.props.filters.group_by == 'Watchers'
            ? 'uuid_w-'
            : this.props.filters.group_by == 'Assignee to'
              ? 'uuid_ass-'
              : this.props.filters.group_by == 'Created by'
                ? 'uuid_a-'
                : '';

      return this.props.group_tables_hide[prefix + groupId];
    },
    setGroupHide(groupId: string, status: boolean) {
      if (this.props.group_tables_hide == null) {
        this.props.group_tables_hide = {};
      }

      let prefix = '';
      if (groupId)
        prefix =
          this.props.filters.group_by == 'Watchers'
            ? 'uuid_w-'
            : this.props.filters.group_by == 'Assignee to'
              ? 'uuid_ass-'
              : this.props.filters.group_by == 'Created by'
                ? 'uuid_a-'
                : '';

      this.props.group_tables_hide[prefix + groupId] = status;
    },
  },

  getters: {
    getTableColumns() {
      return allColumns.filter((column) => {
        if (column.name === 'sequence_id') return true;

        return this.props.columns_to_show.some((c) => c === column?.name);
      });
    },
  },
});
