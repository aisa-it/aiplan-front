import { inject } from 'vue';
import { storeToRefs } from 'pinia';
import { EventBus } from 'quasar';

import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useFormStore } from 'src/stores/form-store';
import { getFormList } from 'src/components/forms/services/api';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import { stopGlobalLoading } from 'src/composables/useGlobalLoader';

export const useUserLoadInfo = () => {
  // Загрузка данных пользователя
  const userStore = useUserStore();
  const formStore = useFormStore();
  const workspaceStore = useWorkspaceStore();

  const { getWsRole } = useRolesStore();

  const { user, userWorkspaces } = storeToRefs(userStore);
  const { workspaceInfo, currentWorkspaceSlug } = storeToRefs(workspaceStore);

  const bus = inject('bus') as EventBus;

  bus.once('successLoadUserInfo', async () => {
    await Promise.all([
      workspaceStore.getWorkspaceInfo(
        (user.value.last_workspace_slug as string) ||
          (userWorkspaces.value[0]?.slug as string),
      ),
      workspaceStore.getWorkspaceProjects(
        (user.value.last_workspace_slug as string) ||
          (userWorkspaces.value[0]?.slug as string),
      ),
    ]);

    currentWorkspaceSlug.value = workspaceInfo?.value?.slug as string;

    if (getWsRole(currentWorkspaceSlug.value ?? '') === 15) {
      await getFormList(currentWorkspaceSlug.value).then(
        (res) => (formStore.forms = res),
      );
    } else formStore.resetForms();

    stopGlobalLoading();
  });
};
