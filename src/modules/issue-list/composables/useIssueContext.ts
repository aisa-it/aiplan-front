import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useRoute } from 'vue-router';

export function useIssueContext(contextType: 'project' | 'sprint') {
  const route = useRoute();

  if (contextType === 'project') {
    const store = useProjectStore();
    const { projectProps, isGroupingEnabled, isKanbanEnabled, issuesLoader } =
      storeToRefs(store);

    const updateProps = async (props: TypesViewProps) => {
      await store.setProjectProps(
        route.params.workspace as string,
        route.params.project as string,
        props,
      );

      await store.getMeInProject(
        route.params.workspace as string,
        route.params.project as string,
      );
    };

    return {
      contextProps: projectProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      isKanbanEnabled,
      issuesLoader,
      store,
      updateProps,
    };
  }

  if (contextType === 'sprint') {
    const store = useSprintStore();
    const { sprintProps, isGroupingEnabled, isKanbanEnabled, issuesLoader } =
      storeToRefs(store);

    const updateProps = async (props: TypesViewProps) => {
      await store.setMyViewProps(props);

      await store.getMyViewProps();
    };

    return {
      contextProps: sprintProps,
      isGroupingEnabled,
      getTableColumns: store.getTableColumns,
      isKanbanEnabled,
      issuesLoader,
      store,
      updateProps,
    };
  }
}
