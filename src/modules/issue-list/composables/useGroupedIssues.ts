import { useIssuesStore } from 'src/stores/issues-store';
import { DEF_ROWS_PER_PAGE, PARSED_GROUP } from 'src/constants/constants';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { inject } from 'vue';
import { EventBus } from 'quasar';
import { useIssueContext } from './useIssueContext';
import { handleNotify } from 'src/utils/notify';
import { DEFAULT_VIEW_PROPS } from 'src/modules/issue-list/constants/defaultProps';

export interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

// префикс группировки по значению дополнительного параметра (BAK-361):
// group_by=property:<uuid шаблона>
export const PROPERTY_GROUP_BY_PREFIX = 'property:';

const isPropertyGroupBy = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith(PROPERTY_GROUP_BY_PREFIX);

export const useGroupedIssues = (contextType: 'project' | 'sprint') => {
  const issuesStore = useIssuesStore();
  const bus = inject('bus') as EventBus;

  const {
    contextProps,
    isKanbanEnabled,
    getIssue,
    getIssueStream,
    GROUP_BY_OPTIONS,
    store,
    issuesLoader,
    updateProps,
  } = useIssueContext(contextType);

  // преобразуем quasar пагинацию в пагинацию бека
  function parsePagination(pagination: QuasarPagination) {
    const rawGroupBy = contextProps.value?.filters?.group_by;

    return {
      only_count: false,
      hide_sub_issues: contextProps.value?.hideSubIssues ?? false,
      only_active: contextProps.value?.showOnlyActive ?? true,
      group_by:
        PARSED_GROUP[rawGroupBy]?.value ||
        GROUP_BY_OPTIONS.find((option) => option.value === rawGroupBy)?.value ||
        // значение property:<uuid> не входит ни в PARSED_GROUP, ни в
        // GROUP_BY_OPTIONS — прокидываем его в запрос как есть
        (isPropertyGroupBy(rawGroupBy) ? rawGroupBy : undefined),
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

  async function getGroupedIssues(signal?: AbortSignal) {
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

    // const response = await getIssue(
    //   filters,
    //   parsePagination(quasarPagination),
    //   signal,
    // );

    // issuesStore.groupedIssueList = response?.data.issues;
    // issuesStore.groupByIssues = response?.data.group_by;

    const pagination = parsePagination(quasarPagination);
    issuesStore.groupByIssues = pagination.group_by ?? '';
    issuesStore.groupedIssueList = [];
    let hasRenderedFirstChunk = false;
    issuesLoader.value = true;

    try {
      return await getIssueStream(filters, pagination, (chunk: any) => {
        issuesStore.groupedIssueList.push(chunk);
        // Снимаем скелетон сразу после первой пришедшей группы, чтобы
        // дальше группы дорисовывались по мере прихода стрима.
        if (!hasRenderedFirstChunk && issuesLoader?.value) {
          hasRenderedFirstChunk = true;
          issuesLoader.value = false;
        }
      });
    } catch (e: any) {
      // 4023 — параметр не поддерживается для группировки,
      // 4501 — шаблон удалён (например, в сохранённой вьюхе).
      // Показываем текст ошибки и сбрасываем группировку на дефолт.
      const isGroupingError = [4023, 4501].includes(e?.code);
      const rawGroupBy = contextProps.value?.filters?.group_by;
      const isPropertyGroup = isPropertyGroupBy(rawGroupBy);

      if (contextType === 'project' && isGroupingError && isPropertyGroup) {
        handleNotify({
          open: true,
          type: 'error',
          customMessage:
            e?.data?.ru_error ||
            e?.ru_error ||
            'Ошибка группировки по параметру',
        });

        issuesStore.groupByIssues = '';
        issuesStore.groupedIssueList = [];

        // сбрасываем group_by в 'none' с сохранением во вьюхе (аналог onUpdate)
        const props = JSON.parse(JSON.stringify(contextProps.value));
        props.filters.group_by = DEFAULT_VIEW_PROPS.filters.group_by;
        await updateProps(props);

        // после сброса group_by = 'none', рекурсии не будет
        return await getGroupedIssues(signal);
      }
      throw e;
    }
  }

  function defineFiltersByEntity(entity) {
    let filters: TypesIssuesListFilters = {};
    switch (issuesStore.groupByIssues) {
      case 'state': {
        if (contextType === 'sprint') {
          const targetState = store.getStatusesAsArray.find(
            (el) => el.name === entity?.name && el.color === entity?.color,
          );
          if (targetState) {
            return { states: targetState.id };
          }
        }
        if (entity?.id) {
          filters = { states: [entity.id] };
        }
        return filters;
      }
      case 'labels': {
        filters = { labels: [entity?.id || ''] };
        return filters;
      }
      case 'priority': {
        // Для "Без приоритета" и др. отправляем пустую строку
        // Карточка доски возвращает строку с приоритетом вместо объекта сущности
        filters = { priorities: [entity?.id || entity || ''] };
        return filters;
      }
      case 'watchers': {
        filters = { watchers: [entity?.id || ''] };
        return filters;
      }
      case 'assignees': {
        filters = { assignees: [entity?.id || ''] };
        return filters;
      }
      case 'author': {
        if (entity?.id) {
          filters = { authors: [entity.id] };
        }
        return filters;
      }
      case 'project': {
        if (entity?.id) {
          filters = { projects: [entity.id] };
        }
        return filters;
      }
      default: {
        if (isPropertyGroupBy(issuesStore.groupByIssues)) {
          const templateId = issuesStore.groupByIssues.slice(
            PROPERTY_GROUP_BY_PREFIX.length,
          );
          // Поле properties появится в TypesIssuesListFilters после выката
          // новой версии @aisa-it/aiplan-api-ts (BAK-361).
          // TODO: убрать каст после бампа пакета.
          (filters as any).properties = {
            [templateId]: [entity ?? ''],
          };
        }
        return filters;
      }
    }
    return filters;
  }

  async function getCurrentTable(index: number, pagination: any, entity: any) {
    const filters: TypesIssuesListFilters = defineFiltersByEntity(entity);

    pagination.order_by = pagination.order_by ?? 'sequence_id';

    const groups = issuesStore.groupedIssueList as any[];

    const sameEntity = (a: any, b: any) => {
      if (a?.id != null && b?.id != null) return a.id === b.id;
      return a === b;
    };

    const targetIndex =
      index != null && index >= 0
        ? index
        : groups.findIndex((g) => sameEntity(g?.entity, entity));

    const upsertGroup = (issues: any[], count: number) => {
      if (targetIndex < 0) {
        groups.push({ entity, issues, count });
        return;
      }

      if (!groups[targetIndex]) {
        groups[targetIndex] = { entity, issues, count };
        return;
      }

      groups[targetIndex].issues = issues;
      groups[targetIndex].count = count;
    };

    await getIssueStream(
      filters,
      pagination,
      (chunk: any) => {
        upsertGroup(chunk.issues, chunk.count);
      },
      // запросы идут дважды — не отменяем.
      { cancelPrevious: false },
    );
  }

  async function updateCurrentTable(field, fieldValue, initialEntity) {
    switch (issuesStore.groupByIssues) {
      case 'state': {
        bus.emit('updateIssueTable', 'state', initialEntity.id);
        bus.emit('updateIssueTable', 'state', fieldValue.state_detail.id);
        break;
      }
      case 'labels': {
        if (field === 'priority') {
          bus.emit('updateIssueTable', 'priority', initialEntity);
        }
        if (field === 'sprint') {
          bus.emit('updateIssueTable', 'sprint', initialEntity?.id);
        }
        fieldValue?.label_details.forEach((label) => {
          bus.emit('updateIssueTable', 'labels', label.id);
        });
        break;
      }
      case 'assignees':
      case 'watchers':
      case 'author': {
        if (field === 'priority') {
          bus.emit('updateIssueTable', 'priority', initialEntity);
        }
        if (field === 'sprint') {
          bus.emit('updateIssueTable', 'sprint', initialEntity?.id);
        }
        fieldValue.assignee_details.forEach((assignee) => {
          bus.emit('updateIssueTable', 'members', assignee.id);
        });
        break;
      }
      case 'project': {
        bus.emit('updateIssueTable', 'project', initialEntity.id);
        break;
      }
      case 'priority': {
        bus.emit('updateIssueTable', 'priority', initialEntity);
        bus.emit('updateIssueTable', 'priority', fieldValue.priority);
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
