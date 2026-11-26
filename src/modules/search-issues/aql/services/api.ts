import axios from 'axios';
import {
  DtoSearchFilterFull,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { API_AUTH_PREFIX } from 'src/constants/apiPrefix';

// Отдельный экземпляр без общего перехватчика ответов: ошибку в запросе
// показывает редактор, общее уведомление было бы дублем
const api = axios.create({ baseURL: '', withCredentials: true });

export interface AqlQueryError {
  message: string;
  // позиции [start, end) в символах запроса
  start: number;
  end: number;
}

// queryError — ошибка в самом запросе, её показывает редактор
export interface AqlFailure {
  ok: false;
  message: string;
  queryError: AqlQueryError | null;
}

// durationMs — время выполнения запроса на бэке; null — бэк его не прислал
export type AqlSearchResult =
  | { ok: true; count: number; issues: any[]; durationMs: number | null }
  | AqlFailure;

const failure = (error: unknown): AqlFailure => {
  const res = axios.isAxiosError(error) ? error.response : undefined;
  if (res?.status === 401) window.location.href = '/signin';

  const data = res?.data;
  return {
    ok: false,
    message: data?.ru_error || data?.error || '',
    queryError: data?.aql
      ? {
          message: data.aql.ru_error || data.aql.error || '',
          start: data.aql.start ?? 0,
          end: data.aql.end ?? 0,
        }
      : null,
  };
};

// Поиск задач по запросу AQL; limit — от 1 до 100
export async function searchIssuesByAql(
  aql: string,
  limit: number,
  offset: number,
): Promise<AqlSearchResult> {
  try {
    const { data } = await api.get(`${API_AUTH_PREFIX}/search/`, {
      params: { aql, limit, offset },
    });

    return {
      ok: true,
      count: data?.count ?? 0,
      issues: data?.issues ?? [],
      durationMs: data?.duration_ms ?? null,
    };
  } catch (error) {
    return failure(error);
  }
}

// Фильтр поиска; aql есть у любого: у старых фильтров его собирает бэк
export type AqlFilter = DtoSearchFilterFull & { aql?: string };

// Тело заменяет фильтр целиком. Пока в нём есть условия filter, бэк собирает
// aql из них; без условий старого фильтра они стираются, остаётся запрос
export interface AqlFilterBody {
  name: string;
  description: string;
  public: boolean;
  aql: string;
  filter?: TypesIssuesListFilters;
}

export type AqlSaveResult = { ok: true } | AqlFailure;

// Создаёт фильтр (id — null) или правит свой; запрос бэк проверяет разбором
export async function saveAqlFilter(
  id: string | null,
  body: AqlFilterBody,
): Promise<AqlSaveResult> {
  try {
    if (id) await api.patch(`${API_AUTH_PREFIX}/filters/${id}/`, body);
    else await api.post(`${API_AUTH_PREFIX}/filters/`, body);

    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
