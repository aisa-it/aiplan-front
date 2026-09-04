import { reactive, ref, shallowRef } from 'vue';

import type {
  DtoIssueWithCount,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

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
  const query = reactive({ ...initialState.query });
  const columns = initialState.columns;

  let requestController: AbortController | undefined;
  let requestNumber = 0;
  let viewSettingsRequest = Promise.resolve();

  const updateViewSettings = (settings: TypesViewProps) => {
    if (!actions) return;

    viewSettingsRequest = viewSettingsRequest
      .then(() => actions.updateViewSettings(settings))
      .catch(() => {
        // TODO: показать уведомление после переноса общей системы уведомлений.
      });
  };

  const load = async () => {
    requestController?.abort();
    const controller = new AbortController();
    requestController = controller;
    const currentRequest = ++requestNumber;

    isLoading.value = true;

    try {
      const result = await source.load(
        initialState.filters,
        query,
        controller.signal,
      );

      if (currentRequest !== requestNumber) return;

      items.value = result.items;
      total.value = result.total;
    } catch {
      if (controller.signal.aborted || currentRequest !== requestNumber) return;

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
    updateViewSettings({ page_size: rowsPerPage });
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
    updateViewSettings({
      filters: {
        order_by: column,
        orderDesc: query.descending,
      },
    });
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

    await load();
    // TODO: показать уведомление об успешном сохранении.
  };

  const getAvailableStates = (issue: DtoIssueWithCount) =>
    actions && canEditField(issue, 'state')
      ? actions.getAvailableStates(issue)
      : Promise.resolve([]);

  return {
    items,
    total,
    isLoading,
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
