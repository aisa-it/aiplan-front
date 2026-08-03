import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import type {
  DtoWorkspaceWithCount,
  AiplanRequestAddFavorite,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

const usersApi = new (withInterceptors(Users))();
const workspaceApi = new (withInterceptors(Workspace))();

export const useUserStore = defineStore('user-store', () => {
  const router = useRouter();
  const user = ref<any>(null);
  const userWorkspaces = ref<DtoWorkspaceWithCount[]>([]);
  const userWorkspacesMemberships = ref<Record<string, any>>({});

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

  async function getUserWorkspaces(
    filters?: { search_query: string },
    isFilters = false,
  ): Promise<DtoWorkspaceWithCount[] | undefined> {
    return workspaceApi.getUserWorkspaceList(filters).then((res) => {
      if (res.data.length === 0 && !isFilters) {
        userWorkspaces.value = [];
        if (
          !isFilters &&
          user.value?.is_onboarded === true &&
          router.currentRoute.value.path !== '/no-workspace/profile'
        ) {
          router.replace('/no-workspace');
        }
        return [];
      }
      userWorkspaces.value = filters ? userWorkspaces.value : res.data;
      return res.data;
    });
  }

  async function updateCurrentUser(data: any) {
    const res = await usersApi.updateCurrentUser(data);
    user.value = res.data;
    return user.value;
  }

  async function deleteFavoriteWorkspace(
    uuid: string | undefined,
  ): Promise<void> {
    if (!uuid || uuid === 'undefined') return;

    await workspaceApi
      .removeWorkspaceFromFavorites(uuid)
      .then(async () => await getUserWorkspaces());
  }

  async function addFavoriteWorkspace(
    data: AiplanRequestAddFavorite,
  ): Promise<void> {
    if (!data.workspace || data.workspace === 'undefined') return;

    await workspaceApi
      .addWorkspaceToFavorites(data)
      .then(async () => await getUserWorkspaces());
  }

  return {
    user,
    userWorkspaces,
    userWorkspacesMemberships,
    getUserInfo,
    getUserWorkspaces,
    updateCurrentUser,
    addFavoriteWorkspace,
    deleteFavoriteWorkspace,
  };
});
