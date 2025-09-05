<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление рабочего пространства</h6>
        <span>
          Вы уверены, что хотите удалить рабочее пространство
          <b>"{{ current_workspace.name }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          @click="handleDeletion"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { toRefs } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { deleteWorkspace } from 'src/modules/workspace-settings/services/api';

// constants
import { SUCCESS_DELETE_WS } from 'src/constants/notifications';

// props
const props = defineProps<{
  isInAdminPanel: boolean;
  currentWorkspace: object;
}>();

const router = useRouter();
const { currentWorkspace: current_workspace } = toRefs(props);

// stores
const userStore = useUserStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { userWorkspaces } = storeToRefs(userStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const handleDeletion = async () => {
  await deleteWorkspace(current_workspace.value.slug).then(async () => {
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_DELETE_WS,
    });
    currentWorkspaceSlug.value = '';
    await userStore.getUserWorkspaces().then(() => {
      if (props.isInAdminPanel) {
        router.push('/admin-panel/workspaces');
      } else {
        router.push(`/${userWorkspaces.value[0]?.slug ?? 'no-workspace'}`);
      }
    });
  });
};
</script>
