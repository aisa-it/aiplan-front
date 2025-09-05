import { useRoute } from 'vue-router';
import { useAsyncDataWithLoadOnMounted } from '../../composables/useAsyncDataWithLoadOnMounted';
import { api } from '../services/api';
import type { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function useUserSettings() {
  const route = useRoute();

  return useAsyncDataWithLoadOnMounted<DtoUserLight, [string]>(
    api.getUser,
    {} as DtoUserLight,
    [route.params.user as string],
  );
}
