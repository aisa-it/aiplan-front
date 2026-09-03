import { reactive, ref, shallowRef } from 'vue';

import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import type {
  IssueColumnKey,
  EditableIssueField,
  IssueFieldPatch,
  IssueListActions,
  IssueListInitialState,
  IssueListSource,
} from './issue-list.types';

export const useIssueListController = (
  source: IssueListSource,
  initialState: IssueListInitialState,
  actions?: IssueListActions,
) => {
  const items = shallowRef<DtoIssueWithCount[]>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const error = shallowRef<unknown>();
  const query = reactive({ ...initialState.query });
  const columns = initialState.columns;

  let requestController: AbortController | undefined;
  let requestNumber = 0;

  const load = async () => {
    requestController?.abort();
    const controller = new AbortController();
    requestController = controller;
    const currentRequest = ++requestNumber;

    isLoading.value = true;
    error.value = undefined;

    try {
      const result = await source.load(
        initialState.filters,
        query,
        controller.signal,
      );

      if (currentRequest !== requestNumber) return;

      items.value = result.items;
      total.value = result.total;
    } catch (requestError) {
      if (controller.signal.aborted || currentRequest !== requestNumber) return;
      error.value = requestError;

      // TODO: показать уведомление после переноса общей системы уведомлений.
    } finally {
      if (currentRequest === requestNumber) isLoading.value = false;
    }
  };

  const setPage = (page: number) => {
    query.page = page;
    void load();
  };

  const setRowsPerPage = (rowsPerPage: number) => {
    query.page = 1;
    query.rowsPerPage = rowsPerPage;
    void load();

    // TODO: сохранять page_size в настройках отображения пользователя.
  };

  const setSort = (column: IssueColumnKey, descending?: boolean) => {
    if (descending !== undefined) {
      query.descending = descending;
    } else if (query.sortBy === column) {
      query.descending = !query.descending;
    } else {
      query.descending = false;
    }

    query.sortBy = column;
    query.page = 1;
    void load();

    // TODO: сохранять сортировку в настройках отображения пользователя.
  };

  const dispose = () => {
    requestController?.abort();
    requestNumber++;
  };

  const canEditField = (issue: DtoIssueWithCount, field: EditableIssueField) =>
    actions?.canEdit(issue, field) ?? false;

  const updateIssue = async (
    issue: DtoIssueWithCount,
    patch: IssueFieldPatch,
  ) => {
    const fields = Object.keys(patch) as EditableIssueField[];
    if (
      !actions ||
      !fields.length ||
      fields.some((field) => !canEditField(issue, field))
    ) {
      throw new Error('Issue cannot be edited');
    }
    const updatedIssue = await actions.update(issue, patch);
    items.value = items.value.map((item) =>
      item.id === issue.id ? { ...item, ...updatedIssue } : item,
    );
    // Обновляем состав и порядок списка с учётом фильтров и сортировки.
    await load();
    // TODO: показать уведомление об успешном сохранении.
  };

  const getAvailableStates = (issue: DtoIssueWithCount) =>
    actions && canEditField(issue, 'state')
      ? actions.getAvailableStates(issue)
      : Promise.resolve([]);

  return {
    scope: source.scope,
    items,
    total,
    isLoading,
    error,
    query,
    columns,
    load,
    setPage,
    setRowsPerPage,
    setSort,
    dispose,
    canEditField,
    updateIssue,
    getAvailableStates,
  };
};

export type IssueListController = ReturnType<typeof useIssueListController>;
