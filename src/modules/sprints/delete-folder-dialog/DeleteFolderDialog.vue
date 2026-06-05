<template>
  <q-dialog @hide="emits('hideMenu')">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удалить папку?</h6>
        <p>Удалить можно только пустую папку</p>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup style="width: 110px" />
        <q-btn
          flat
          no-caps
          class="btn secondary-negative-btn"
          label="Удалить"
          style="width: 110px"
          v-close-popup
          @click="handleDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { deleteSprintFolder } from '../services/api';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{
  folderId: string;
  folderName: string;
}>();
const emits = defineEmits<{ success: []; hideMenu: [] }>();

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const { setNotificationView } = useNotificationStore();

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const handleDelete = async (): Promise<void> => {
  await deleteSprintFolder(
    currentWorkspaceSlug.value ?? '',
    props.folderId,
  )
    .then(() => {
      showNotification('success', `Папка ${props.folderName} удалена`);
      emits('success');
    })
    .catch(() => {
      showNotification('error', `Ошибка удаления папки ${props.folderName}`);
    });
};
</script>
