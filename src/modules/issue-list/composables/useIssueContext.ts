import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import {
  TypesIssuesListFilters,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useRoute } from 'vue-router';
import { IQuery, useIssuesStore } from 'src/stores/issues-store';
import {
  NEW_GROUP_BY_OPTIONS,
  SPRINT_GROUP_BY_OPTIONS,
} from 'src/constants/constants';

export function useIssueContext(contextType: 'project' | 'sprint') {
  const issuesStore = useIssuesStore();
  const route = useRoute();

  if (contextType === 'project') {
    const store = useProjectStore();
    const { projectProps, isGroupingEnabled, isKanbanEnabled, issuesLoader } =
      storeToRefs(store);

    const updateProps = async (props: TypesViewProps) => {
      const { showSubIssues, ...newProps } = props;
      await store.setProjectProps(
        route.params.workspace as string,
        route.params.project as string,
        newProps,
      );

      await store.getMeInProject(
        route.params.workspace as string,
        route.params.project as string,
      );

      projectProps.value.hideSubIssues =
        projectProps.value.hideSubIssues ?? false;
    };

    const getIssue = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
    ) => {
      const response = await issuesStore.getIssuesTable(
        route.params.workspace as string,
        route.params.project as string,
        filters,
        pagination,
      );
      return response;
    };

    return {
      contextProps: projectProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      GROUP_BY_OPTIONS: NEW_GROUP_BY_OPTIONS,
      isKanbanEnabled,
      issuesLoader,
      store,
      updateProps,
      getIssue,
      isGroupHide: store.isGroupHide,
      setGroupHide: store.isGroupHide,
    };
  }

  if (contextType === 'sprint') {
    const store = useSprintStore();
    const { sprintProps, isGroupingEnabled, isKanbanEnabled, issuesLoader } =
      storeToRefs(store);

    const updateProps = async (props?: TypesViewProps) => {
      if (props) {
        const { showSubIssues, ...newProps } = props;
        await store.setMyViewProps(
          route.params.workspace as string,
          route.params.sprint as string,
          newProps,
        );
      }

      await store.getMyViewProps(
        route.params.workspace as string,
        route.params.sprint as string,
      );

      sprintProps.value.issueView = sprintProps.value.issueView || 'list';
      sprintProps.value.hideSubIssues =
        sprintProps.value.hideSubIssues ?? false;
    };

    const getIssue = async (
      filters: TypesIssuesListFilters,
      pagination: IQuery,
    ) => {
      const response = await store.getIssueList(
        route.params.workspace as string,
        route.params.sprint as string,
        filters,
        pagination,
      );
      return response;
    };

    return {
      contextProps: sprintProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      GROUP_BY_OPTIONS: SPRINT_GROUP_BY_OPTIONS,
      isKanbanEnabled,
      issuesLoader,
      store,
      updateProps,
      getIssue,
      isGroupHide: store.isGroupHide,
      setGroupHide: store.isGroupHide,
    };
  }
}
