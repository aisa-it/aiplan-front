import { SearchFilters } from '@aisa-it/aiplan-api-ts/src/SearchFilters';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { useAiplanStore } from 'src/stores/aiplan-store';

const api = new (withInterceptors(SearchFilters))();

const getFilters = async () => {
  return (await api.getSearchFilterList()).data.result;
};

const getMyFilters = async () => {
  return (await api.getMySearchFilterList()).data;
};

const getFilterById = async (filterId: string) => {
  return (await api.getSearchFilter(filterId)).data;
};

// ---------------------------------------------------------------------------
// JQL
// ---------------------------------------------------------------------------

export interface JqlSearchResponse {
  count: number;
  offset: number;
  limit: number;
  issues: any[];
}

/**
 * Выполняет JQL-запрос через POST /api/auth/issues/jql/.
 * При ошибке (400) бросает исключение с текстом из тела ответа (поле error).
 */
const jqlSearch = async (
  query: string,
  limit = 20,
  offset = 0,
): Promise<JqlSearchResponse> => {
  const { api: axiosApi } = useAiplanStore();
  const { data } = await axiosApi.post('/api/auth/issues/jql/', {
    query,
    limit,
    offset,
  });
  return data;
};

export { getFilters, getMyFilters, getFilterById, jqlSearch };
