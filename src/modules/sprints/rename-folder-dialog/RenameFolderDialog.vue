<template>
  <q-dialog @escape-key="resetName">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Переименовать папку {{ folderName }}?</h6>
        <q-input
          v-model="folderNewName"
          class="base-textarea full-w"
          dense
          autogrow
          autofocus
          hide-bottom-space
          :rules="[
            (val) =>
              (val.trim() && val.trim().length > 0) ||
              'Необходимо ввести название',
          ]"
          @click.stop
          @touchstart.stop
        >
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup style="width: 110px" @click="resetName"/>
        <SaveButton v-close-popup style="width: 110px" @click="handleSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { updateSprintFolder } from '../services/api';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import SaveButton from 'src/components/buttons/SaveButton.vue';
import { ref } from 'vue';
import { DtoRequestSprintFolder } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  folderId: string,
  folderName: string,
}>();
const emits = defineEmits<{ success: []; }>();

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const { setNotificationView } = useNotificationStore();

const folderNewName = ref(props.folderName);
const resetName = () => {
  folderNewName.value = props.folderName;
}

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const handleSave = async (): Promise<void> => {
  if (folderNewName.value !== props.folderName) {
    const data: DtoRequestSprintFolder = {
      name: folderNewName.value,
    };
    try {
      await updateSprintFolder(
        currentWorkspaceSlug.value || '',
        props.folderId as string,
        data,
      );
    } catch {
      showNotification('error', 'Ошибка переименования папки');
      resetName();
      return;
    }
    const successMessage = `Имя папки "${props.folderName}" изменено на "${folderNewName.value}"`;
    showNotification('success', successMessage);
    emits('success');
  }
};
</script>
