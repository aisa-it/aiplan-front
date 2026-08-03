import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type {
  AiplanUserUpdateRequest,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const usersApi = new (withInterceptors(Users))();

export const useUserStore = defineStore('user-store', () => {
  const router = useRouter();
  const user = ref<DtoUser | null>(null);

  async function getUserInfo() {
    try {
      const res = await usersApi.getCurrentUser();
      user.value = res.data;

      if (router?.currentRoute?.value?.path.includes('not-found')) {
        return;
      }

      if (!res.data.is_onboarded) {
        return router.replace('/onboarding');
      }

      if (user.value.theme?.open_in_new === undefined) {
        await updateCurrentUser({
          theme: {
            dark: user.value.theme?.dark,
            contrast: user.value.theme?.contrast,
            open_in_new: false,
          },
        });
      }

      return user.value;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function updateCurrentUser(data: AiplanUserUpdateRequest) {
    const res = await usersApi.updateCurrentUser(data);
    user.value = res.data;
    return user.value;
  }

  return {
    user,
    getUserInfo,
    updateCurrentUser,
  };
});
