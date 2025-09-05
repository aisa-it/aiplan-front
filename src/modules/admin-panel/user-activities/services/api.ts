import { useAiplanStore } from 'src/stores/aiplan-store';
import { API_ADMIN_PREFIX } from 'src/constants/apiPrefix';
import { IActivity } from '../interfaces/type';
import { IQueryParams } from 'src/shared/types/query-params';
import { DaoPaginationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const { api: apiAdmin } = useAiplanStore();
//TODO сделать через сгенерированное апи, когда будет контракт

export const api = {
  getUserActivities: async (
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: IActivity;
    }
  > => {
    return apiAdmin
      .get(`${API_ADMIN_PREFIX}/activities/`, { params: data })
      .then((res) => res.data);
  },
};
