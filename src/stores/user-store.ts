import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import type {
  AiplanUserUpdateRequest,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { RequestParams } from '@aisa-it/aiplan-api-ts/src/http-client';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

const usersApi = new (withInterceptors(Users))();

type UpdateCurrentUserRequest = AiplanUserUpdateRequest & {
  tutorial?: DtoUser['tutorial'];
};

type UpdateCurrentUserOptions = Pick<RequestParams, 'localErrorCodes'>;

export const useUserStore = defineStore('user-store', () => {
  const user = ref<DtoUser | null>(null);
  const projectRoleName = ref('');
  const workspaceRoleName = ref('');

  async function getUserInfo() {
    try {
      const res = await usersApi.getCurrentUser();
      user.value = res.data;

      if (user.value?.theme?.open_in_new === undefined) {
        await updateCurrentUser({
          theme: {
            dark: user.value?.theme?.dark,
            contrast: user.value?.theme?.contrast,
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

  async function updateCurrentUser(
    data: UpdateCurrentUserRequest,
    options: UpdateCurrentUserOptions = {},
  ) {
    const res = await usersApi.updateCurrentUser(data, options);
    user.value = res.data;
    return user.value;
  }

  function replaceUser(updatedUser: DtoUser) {
    user.value = updatedUser;
  }

  return {
    user,
    projectRoleName,
    workspaceRoleName,
    getUserInfo,
    replaceUser,
    updateCurrentUser,
  };
});
