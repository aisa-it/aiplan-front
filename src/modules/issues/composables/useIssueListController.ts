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
} from '../model/issue-list.types';
import { createIssueListInitialState } from '../model/issue-list.defaults';
import { toast } from '@/modules/toast/toast';

export const useIssueListController = (
  source: IssueListSource,
  initialState: IssueListInitialState,
  actions?: IssueListActions,
  grouping?: {
    isActive: () => boolean;
    refreshAfterUpdate: (before: DtoIssueWithCount, after: DtoIssueWithCount) => Promise<void>;
  },
) => {
  const items = shallowRef<DtoIssueWithCount[]>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const query = reactive({ ...initialState.query });
  const filters = reactive({ ...initialState.filters });
  const columns = reactive([...initialState.columns]);

  let requestController: AbortController | undefined;
  let requestNumber = 0;
  let disposed = false;
  const updateViewSettings = (settings: TypesViewProps) => {
    if (!actions) return;
    void actions.updateViewSettings(settings).catch(() => {});
  };

  const load = async () => {
    if (disposed) return;
    requestController?.abort();
    if (grouping?.isActive()) {
      requestNumber++;
      isLoading.value = false;
      return;
    }
    const controller = new AbortController();
    requestController = controller;
    const currentRequest = ++requestNumber;

    isLoading.value = true;

    try {
      const result = await source.load(filters, query, controller.signal);

      if (currentRequest !== requestNumber) return;

      items.value = result.items;
      total.value = result.total;
    } catch {
      if (controller.signal.aborted || currentRequest !== requestNumber) return;
    } finally {
      if (currentRequest === requestNumber) isLoading.value = false;
    }
  };

  const setPage = (page: number) => {
    query.page = page;
    void load();
  };

  const applyViewSettings = (settings: TypesViewProps | undefined, reload = true) => {
    const next = createIssueListInitialState(settings);
    const changed =
      Object.keys(next.query).some(
        (key) =>
          query[key as keyof typeof query] !==
          next.query[key as keyof typeof query],
      ) ||
      JSON.stringify(filters) !== JSON.stringify(next.filters) ||
      JSON.stringify(columns) !== JSON.stringify(next.columns);
    if (!changed) return;

    Object.assign(query, next.query, { page: 1 });
    Object.assign(filters, next.filters);
    columns.splice(0, columns.length, ...next.columns);
    if (reload) void load();
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
    disposed = true;
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
    if (disposed) return;

    if (grouping?.isActive()) {
      toast.success();
      await grouping.refreshAfterUpdate(issue, { ...issue, ...patch, ...updatedIssue });
      return;
    }
    items.value = items.value.map((item) =>
      item.id === issue.id ? { ...item, ...updatedIssue } : item,
    );

    toast.success();
    await load();
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
    filters,
    columns,
    load,
    applyViewSettings,
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
