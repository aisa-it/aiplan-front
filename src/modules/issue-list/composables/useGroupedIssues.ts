import { useIssuesStore } from 'src/stores/issues-store';
import { DEF_ROWS_PER_PAGE, PARSED_GROUP } from 'src/constants/constants';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { inject } from 'vue';
import { EventBus } from 'quasar';
import { useIssueContext } from './useIssueContext';

export interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

export const useGroupedIssues = (contextType: 'project' | 'sprint') => {
  const issuesStore = useIssuesStore();
  const bus = inject('bus') as EventBus;

  const { contextProps, isKanbanEnabled, getIssue, GROUP_BY_OPTIONS } =
    useIssueContext(contextType);

  // преобразуем quasar пагинацию в пагинацию бека
  function parsePagination(pagination: QuasarPagination) {
    return {
      only_count: false,
      hide_sub_issues: contextProps.value?.hideSubIssues ?? false,
      only_active: contextProps.value?.showOnlyActive ?? true,
      group_by:
        PARSED_GROUP[contextProps.value?.filters?.group_by]?.value ||
        GROUP_BY_OPTIONS.find(
          (option) => option.value === contextProps.value?.filters?.group_by,
        )?.value,
      order_by: pagination.sortBy ?? 'sequence_id',
      desc: pagination.descending,
      draft: contextProps.value?.draft,
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
        : (contextProps.value?.filters?.order_by as string),
      descending: isKanbanEnabled.value
        ? true
        : (contextProps.value?.filters?.orderDesc as boolean),
      rowsPerPage: contextProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
    };

    const filters = {
      states: [] as string[],
      assigned_to_me: contextProps.value?.filters.assignedToMe,
      authored_by_me: contextProps.value?.filters.authoredToMe,
      watched_by_me: contextProps.value?.filters.watchedToMe,
    };
    if (contextProps.value?.filters?.states?.length) {
      filters.states = contextProps?.value?.filters?.states;
    }
    const response = await getIssue(filters, parsePagination(quasarPagination));

    issuesStore.groupedIssueList = response?.data.issues;
    issuesStore.groupByIssues = response?.data.group_by;
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
      case 'project': {
        filters = { projects: [entity ? entity.id : ''] };
        return filters;
      }
    }
    return filters;
  }

  async function getCurrentTable(index: number, pagination: any, entity: any) {
    const filters: TypesIssuesListFilters = defineFiltersByEntity(entity);
    pagination.order_by = pagination.order_by ?? 'sequence_id';
    const response = await getIssue(filters, pagination);

    const data = response?.data?.issues;
    issuesStore.groupedIssueList[index].issues =
      Array.isArray(data) && data[0]?.issues
        ? data[0].issues
        : (data ?? []);
    issuesStore.groupedIssueList[index].count = response?.data?.count ?? 0;
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
      case 'project': {
        bus.emit('updateIssueTable', 'project', initialEntity.id);
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
