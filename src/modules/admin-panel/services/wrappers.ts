import { DaoPaginationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IQueryParams } from 'src/shared/types/query-params';

type PaginatedResult<T> = DaoPaginationResponse & { result?: T[] };

export function apiWrapperWithIds<T, Ctx extends string[]>(
  apiFunc: (...args: [...Ctx, IQueryParams?]) => Promise<PaginatedResult<T>>,
) {
  return (
    paginationArgs?: IQueryParams,
    ...context: Ctx
  ): Promise<PaginatedResult<T>> => {
    if (!context.length || context.some((id) => !id)) {
      throw new Error('All required IDs must be provided in context');
    }
    return apiFunc(...context, paginationArgs ?? {});
  };
}
