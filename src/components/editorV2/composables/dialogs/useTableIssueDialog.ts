import { ref, watch } from 'vue';
import { QDialog } from 'quasar';
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/core';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';

import { formatDateTime } from 'src/utils/time';
import { escapeHtml } from 'src/utils/helpers';
import {
  COLUMN_FILTERS_MAP,
  TABLE_PRIORITY_FILTERS,
} from 'src/constants/tableFilters';

import {
  DtoIssue,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IIssueSearchInfo, IIssueTableParams } from 'src/interfaces/tableIssue';

// Диалоговое окно редактора для создания таблицы задач
export const useTableIssueDialog = (
  props: {
    editorInstance: Editor;
    savedTableData: { element: HTMLElement; params: IIssueTableParams } | null;
    classPrevent?: string;
  },
  dialogRef: QDialog | null,
) => {
  const filtersStore = useFiltersStore();
  const { currentWorkspaceSlug, workspaceInfo } =
    storeToRefs(useWorkspaceStore());
  const { getIssueDataById } = useSingleIssueStore();

  const currentFilter = ref<TypesIssuesListFilters | undefined | null>({
    search_query: '',
  });
  const checkedIssues = ref<DtoIssue[]>([]);

  const chosenTableColumns = ref<typeof COLUMN_FILTERS_MAP>([
    { label: 'Название', key: 'name' },
    { label: 'Приоритет', key: 'priority' },
    { label: 'Статус', key: 'state' },
    { label: 'Исполнитель', key: 'assignees' },
  ]);
  const restTableColumns = ref<typeof COLUMN_FILTERS_MAP>([]);
  const additionalColumnsNumber = ref<number | undefined>(2);

  // Применение фильтра
  const handleUpdateFilter = async (
    filter: TypesIssuesListFilters | undefined | null,
  ): Promise<void> => {
    currentFilter.value = {
      ...filter,
    };
    await refresh();
  };

  const refreshFilters = async (): Promise<void> => {
    filtersStore.filterList = await getFilters();
  };

  const refreshMyFilters = async (): Promise<void> => {
    filtersStore.myFilterList = await getMyFilters();
  };

  const refresh = async (): Promise<void> => {
    for (const key in filtersStore.columnsToShow) {
      filtersStore.columnsToShow[
        key as keyof typeof filtersStore.columnsToShow
      ] = ['sequence_id', 'name', 'priority', 'state'].includes(key);
    }
    await refreshFilters();
    await refreshMyFilters();
  };

  // Выбор столбцов в q-select
  const addChosenColumns = (
    val: string,
    done: (val?: string | null) => void,
  ): void => {
    if (!val?.trim()) {
      done(null);
      return;
    }

    const labels = val
      .split(/[,;|]+/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const currentKeys = new Set(chosenTableColumns.value.map((col) => col.key));
    const newSelection = [...chosenTableColumns.value];

    labels.forEach((label) => {
      const found = COLUMN_FILTERS_MAP.find((col) => col.label === label);
      if (found && !currentKeys.has(found.key)) {
        newSelection.push(found);
        currentKeys.add(found.key);
      }
    });

    chosenTableColumns.value = newSelection;
    done(null);
  };

  const handleSelectFilter = (
    val: string,
    update: (fn: () => void) => void,
  ): void => {
    update(() => {
      if (!val) {
        restTableColumns.value = COLUMN_FILTERS_MAP;
      } else {
        restTableColumns.value = COLUMN_FILTERS_MAP.filter((col) =>
          col.label.toLowerCase().includes(val.toLowerCase()),
        );
      }
    });
  };

  const removeCheckedIssue = (id: string): void => {
    checkedIssues.value = checkedIssues.value.filter((el) => el.id !== id);
  };

  // Генерация HTML таблицы задач
  const createIssueTable = (): void => {
    const cols = chosenTableColumns.value;
    const extraCols = Math.max(0, additionalColumnsNumber.value || 0);

    // Заголовки
    const headerCells = cols.map((col) => {
      const text = col.label.trim();
      const safeText = text === '' ? '&nbsp;' : escapeHtml(text);
      return `<th contenteditable="false">${safeText}</th>`;
    });
    for (let i = 0; i < extraCols; i++) {
      headerCells.push('<th>&nbsp;</th>');
    }
    const thead = `<thead><tr>${headerCells.join('')}</tr></thead>`;

    // Строки данных
    const bodyRows = checkedIssues.value
      .map((issue) => {
        const cells = cols.map((col) => {
          let displayValue: string;

          switch (col.key) {
            case 'name':
              displayValue = issue.name || '-';
              const issueLink =
                issue.short_url ||
                issue.url ||
                `/${issue.workspace_detail?.slug}/projects/${issue.project_detail?.id}/issues/${issue.id}`;
              return `<td contenteditable="false"><a target="_blank" rel="nofollow" href="${issueLink}"><span style="font-size: 14px;">${escapeHtml(String(displayValue).trim())}</span></a></td>`;

            case 'sequence_id':
              displayValue = String(issue.sequence_id || '-');
              break;

            case 'priority':
              displayValue =
                TABLE_PRIORITY_FILTERS[
                  issue.priority as keyof typeof TABLE_PRIORITY_FILTERS
                ] ||
                issue.priority ||
                '-';
              break;

            case 'state':
              displayValue = issue.state_detail?.name || '-';
              break;

            case 'author':
              displayValue =
                issue.author_detail?.username ||
                issue.author_detail?.email ||
                '-';
              break;

            case 'assignees':
              if (Array.isArray(issue.assignee_details)) {
                displayValue =
                  issue.assignee_details
                    .map((a: any) => a.username || a.email || '')
                    .filter(Boolean)
                    .join(', ') || '-';
              } else {
                displayValue = '-';
              }
              break;

            case 'labels':
            case 'sprints':
              if (Array.isArray(issue[col.key])) {
                displayValue =
                  issue[col.key]
                    .map((l: any) => l.name || '')
                    .filter(Boolean)
                    .join(', ') || '-';
              } else {
                displayValue = '-';
              }
              break;

            case 'target_date':
            case 'created_at':
            case 'updated_at':
              displayValue = issue[col.key]
                ? formatDateTime(issue[col.key])
                : '-';
              break;

            default:
              displayValue =
                issue[col.key] !== null ? String(issue[col.key]) : '-';
          }

          let text = String(displayValue).trim();
          text = text === '' ? '&nbsp;' : escapeHtml(text);
          return `<td contenteditable="false"><span style="font-size: 14px;">${text}</span></td>`;
        });

        for (let i = 0; i < extraCols; i++) {
          cells.push('<td><span style="font-size: 14px;">&nbsp;</span></td>');
        }

        return `<tr>${cells.join('')}</tr>`;
      })
      .join('');

    const tbody = bodyRows ? `<tbody>${bodyRows}</tbody>` : '';

    // Запись данных в data-атрибуты для возможности редактирования таблицы
    const tableParams: IIssueTableParams = {
      chosenTableColumns: chosenTableColumns.value,
      additionalColumnsNumber: additionalColumnsNumber.value ?? 0,
      checkedIssuesInfo: checkedIssues.value.map((issue) => ({
        id: issue.id,
        workspaceSlug: issue.workspace_detail?.slug,
        projectId: issue.project,
      })),
    };
    const encodedParams = encodeURIComponent(JSON.stringify(tableParams));
    const tableHtml =
      `<p></p><table class="issue-table" ${encodedParams ? `data-issue-table-params="${encodedParams}"` : ''}>${thead}${tbody}</table>`.trim();

    // Вставка HTML
    if (props.savedTableData) {
      const { element } = props.savedTableData;
      const pos = props.editorInstance.view.posAtDOM(element, 0);
      const $pos = props.editorInstance.state.doc.resolve(pos);
      const depth = $pos.depth;

      if ($pos.node(depth).type.name === 'table') {
        const from = $pos.before(depth);
        const to = $pos.after(depth);

        props.editorInstance
          .chain()
          .focus(from)
          .deleteRange({ from, to })
          .insertContentAt(from, tableHtml)
          .run();
      }
    } else {
      props.editorInstance.chain().focus().insertContent(tableHtml).run();
    }
    handleCloseDialog();
  };

  // Работа окна диалога
  async function handleOpenDialog(): Promise<void> {
    currentFilter.value = {
      workspaces: [workspaceInfo?.value?.id ?? ''],
    };

    if (!workspaceInfo?.value?.id) {
      console.warn('Workspace ID не найден при загрузке issues');
      checkedIssues.value = [];
    }
    await refresh();
  }

  function handleCloseDialog(): void {
    chosenTableColumns.value = [
      { label: 'Название', key: 'name' },
      { label: 'Приоритет', key: 'priority' },
      { label: 'Статус', key: 'state' },
      { label: 'Исполнитель', key: 'assignees' },
    ] satisfies typeof COLUMN_FILTERS_MAP;
    additionalColumnsNumber.value = 2;
    checkedIssues.value = [];
    dialogRef?.value?.hide();
  }

  // Загрузка параметров таблицы из data-атрибута
  watch(
    () => props.savedTableData,
    async (data) => {
      if (!data) return;
      chosenTableColumns.value = data.params.chosenTableColumns;
      additionalColumnsNumber.value = data.params.additionalColumnsNumber;

      // Подгрузка задач
      try {
        const promises = data.params.checkedIssuesInfo.map(
          (issue: IIssueSearchInfo) =>
            getIssueDataById(issue.workspaceSlug, issue.projectId, issue.id),
        );
        const responses = await Promise.all(promises);
        checkedIssues.value = responses.map((res) => res.data);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
        checkedIssues.value = [];
      }
    },
  );

  return {
    currentFilter,
    checkedIssues,
    chosenTableColumns,
    additionalColumnsNumber,
    handleUpdateFilter,
    removeCheckedIssue,
    addChosenColumns,
    handleSelectFilter,
    createIssueTable,
    handleOpenDialog,
    handleCloseDialog,
  };
};
