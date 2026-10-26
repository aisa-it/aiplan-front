import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  UserService,
  type UpdateCurrentUserRequest,
} from '@/services/user.service';

export const useUserStore = defineStore('user-store', () => {
  const user = ref<DtoUser | null>(null);
  const projectRoleName = ref('');
  const workspaceRoleName = ref('');

  async function getUserInfo() {
    try {
      user.value = await UserService.getCurrentUser();

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

  async function updateCurrentUser(data: UpdateCurrentUserRequest) {
    user.value = await UserService.updateCurrentUser(data);
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
