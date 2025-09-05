import { ref, onMounted } from 'vue';
import { useAsyncDataWithLoadOnMounted } from './useAsyncDataWithLoadOnMounted';
import { DaoPagination } from '../feedbacks/interfaces/types';
import { DaoPaginationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IQueryParams } from 'src/shared/types/query-params';

const DEFAULT_ROWS_PER_PAGE = 10;

const getArgs = (
  pagination: DaoPagination,
  search_query: string | undefined = undefined,
): IQueryParams => {
  const { page, rowsPerPage, sortBy, descending } = pagination;

  const offset =
    (page - 1) * (rowsPerPage == 0 ? DEFAULT_ROWS_PER_PAGE : rowsPerPage);
  const limit = rowsPerPage == 0 ? DEFAULT_ROWS_PER_PAGE : rowsPerPage;

  return {
    offset: offset,
    limit: limit,
    order_by: sortBy,
    desc: descending,
    search_query: search_query,
  };
};

export function useTableWithPagination<T>(
  syncFunction: (
    data?: IQueryParams,
    ...context: any[]
  ) => Promise<DaoPaginationResponse & { result?: T[] }>,
  contextArgs: any[] = [],
) {
  const pagination = ref<DaoPagination>({
    page: 1,
    rowsPerPage: DEFAULT_ROWS_PER_PAGE,
  });

  const rows = ref<T[]>([]);

  const currentContext = ref(contextArgs);

  const { loading, data, execute, ready } = useAsyncDataWithLoadOnMounted(
    syncFunction,
    { count: 0, limit: 0, result: [] },
    [getArgs(pagination.value), ...currentContext.value],
  );

  const refresh = async (
    props: { pagination: DaoPagination },
    search_query: string | undefined = undefined,
    ...context: any[]
  ) => {
    pagination.value.sortBy = props.pagination.sortBy;
    pagination.value.descending = props.pagination.descending;
    pagination.value.page = props.pagination.page;

    currentContext.value = context.length ? context : currentContext.value;

    await execute([
      getArgs(props.pagination, search_query),
      ...currentContext.value,
    ]).then(setData);
  };

  const setData = (res: DaoPaginationResponse & { result?: T[] }) => {
    pagination.value.rowsNumber = res.count ?? 0;
    pagination.value.rowsPerPage = res.limit ?? DEFAULT_ROWS_PER_PAGE;
    rows.value = res.result ?? [];
  };

  onMounted(async () => {
    await ready;
    setData(data.value);
  });

  return {
    loading,
    rows,
    pagination,
    refresh,
  };
}
