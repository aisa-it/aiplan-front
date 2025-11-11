import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { storeToRefs } from 'pinia';
import {
  DEF_ROWS_PER_PAGE,
  NEW_GROUP_BY_OPTIONS,
  PARSED_GROUP,
} from 'src/constants/constants';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { inject } from 'vue';
import { EventBus } from 'quasar';

export interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

export const useGroupedIssues = () => {
  const issuesStore = useIssuesStore();
  const bus = inject('bus') as EventBus;

  const { project, projectProps, isKanbanEnabled } =
    storeToRefs(useProjectStore());
  const { workspaceInfo } = storeToRefs(useWorkspaceStore());

  // преобразуем quasar пагинацию в пагинацию бека
  function parsePagination(pagination: QuasarPagination) {
    return {
      only_count: false,
      show_sub_issues: projectProps.value?.showSubIssues ?? true,
      only_active: projectProps.value?.showOnlyActive ?? true,
      group_by:
        PARSED_GROUP[projectProps.value?.filters?.group_by]?.value ||
        NEW_GROUP_BY_OPTIONS.find(
          (option) => option.value === projectProps.value?.filters?.group_by,
        )?.value,
      order_by: pagination.sortBy ?? 'sequence_id',
      desc: pagination.descending,
      draft: projectProps.value?.draft,
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
      sortBy: isKanbanEnabled.value
        ? 'sequence_id'
        : (projectProps.value?.filters?.order_by as string),
      descending: isKanbanEnabled.value
        ? true
        : (projectProps.value?.filters?.orderDesc as boolean),
      rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
    };

    const filters = {
      states: [] as string[],
      assigned_to_me: projectProps.value?.filters.assignedToMe,
      authored_by_me: projectProps.value?.filters.authoredToMe,
      watched_by_me: projectProps.value?.filters.watchedToMe,
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

  function defineFiltersByEntity(entity) {
    let filters;
    switch (issuesStore.groupByIssues) {
      case 'state': {
        filters = { states: [entity.id] };
        return filters;
      }
      case 'labels': {
        filters = { labels: [entity ? entity.id : ''] };
        return filters;
      }
      case 'priority': {
        filters = { priorities: [entity || ''] };
        return filters;
      }
      case 'watchers': {
        filters = { watchers: [entity ? entity.id : ''] };
        return filters;
      }
      case 'assignees': {
        filters = { assignees: [entity ? entity.id : ''] };
        return filters;
      }
      case 'author': {
        filters = { authors: [entity ? entity.id : ''] };
        return filters;
      }
    }
    return filters;
  }

  async function getCurrentTable(index: number, pagination: any, entity: any) {
    const filters: TypesIssuesListFilters = defineFiltersByEntity(entity);
    pagination.order_by = pagination.order_by ?? 'sequence_id';
    const response = await issuesStore.getIssuesTable(
      workspaceInfo?.value?.id as string,
      project.value.id as string,
      filters,
      pagination,
    );

    issuesStore.groupedIssueList[index].issues = response?.data.issues;
    issuesStore.groupedIssueList[index].count = response?.data.count;
  }

  async function updateCurrentTable(field, fieldValue, initialEntity) {
    switch (issuesStore.groupByIssues) {
      case 'state': {
        bus.emit('updateIssueTable', 'state', initialEntity.id);
        bus.emit('updateIssueTable', 'state', fieldValue.state_detail.id);
        break;
      }
      case 'labels': {
        fieldValue?.label_details.forEach((label) => {
          bus.emit('updateIssueTable', 'labels', label.id);
        });
        break;
      }
      case 'assignees':
      case 'watchers':
      case 'author': {
        fieldValue.assignee_details.forEach((assignee) => {
          bus.emit('updateIssueTable', 'members', assignee.id);
        });
        break;
      }
    }
    return;
  }

  return {
    getGroupedIssues,
    parsePagination,
    getCurrentTable,
    updateCurrentTable,
  };
};
