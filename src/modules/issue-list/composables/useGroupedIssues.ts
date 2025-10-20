import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { storeToRefs } from 'pinia';
import {
  DEF_ROWS_PER_PAGE,
  NEW_GROUP_BY_OPTIONS,
  PARSED_GROUP,
} from 'src/constants/constants';
import { useWorkspaceStore } from 'src/stores/workspace-store';

export interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

export const useGroupedIssues = () => {
  const issuesStore = useIssuesStore();

  const { project, projectProps, isKanbanEnabled } =
    storeToRefs(useProjectStore());
  const { workspaceInfo } = storeToRefs(useWorkspaceStore());

  // преобразуем quasar пагинацию в пагинацию бека
  function parsePagination(pagination: QuasarPagination) {
    return {
      only_count: false,
      show_sub_issue: projectProps.value?.showSubIssues ?? true,
      only_active: projectProps.value?.showOnlyActive ?? true,
      group_by:
        PARSED_GROUP[projectProps.value?.filters?.group_by]?.value ||
        NEW_GROUP_BY_OPTIONS.find(
          (option) => option.value === projectProps.value?.filters?.group_by,
        )?.value,
      order_by: pagination.sortBy,
      desc: pagination.descending,
      offset:
        (pagination.page - 1) *
        (pagination.rowsPerPage == 0 ? 10 : pagination.rowsPerPage),
      limit:
        pagination.rowsPerPage == 0
          ? pagination.rowsNumber || 10
          : pagination.rowsPerPage,
    };
  }

  async function getGroupedIssues() {
    const quasarPagination: QuasarPagination = {
      page: 1,
      rowsNumber: 0,
      sortBy: isKanbanEnabled
        ? 'sequence_id'
        : (projectProps.value?.filters?.order_by as string),
      descending: isKanbanEnabled
        ? true
        : (projectProps.value?.filters?.orderDesc as boolean),
      rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
    };

    const filters = {
      states: [] as string[],
    };
    if (projectProps.value?.filters?.states?.length) {
      filters.states = projectProps?.value?.filters?.states;
    }
    const response = await issuesStore.getIssuesTable(
      workspaceInfo?.value?.id as string,
      project?.value.id,
      filters,
      parsePagination(quasarPagination),
    );

    issuesStore.groupedIssueList = await response?.data.issues;
    issuesStore.groupByIssues = await response?.data.group_by;
  }

  return { getGroupedIssues, parsePagination };
};
