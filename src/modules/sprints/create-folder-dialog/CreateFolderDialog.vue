<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Создание папки спринта</h6>
        <q-input
          dense
          v-model="folderName"
          class="q-ml-sm base-input"
          style="flex: 1"
          label="Название"
          ref="titleRef"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Необходимо ввести название',
          ]"
        />
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup style="width: 110px" @click="resetName"/>
        <q-btn
          flat
          no-caps
          class="btn primary-btn"
          label="Создать"
          style="width: 110px"
          v-close-popup
          @click="handleCreate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { createSprintFolder } from '../services/api';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import { useNotificationStore } from 'src/stores/notification-store';
import { ref } from 'vue';

// const props = defineProps<{ folderName: string }>();
const emits = defineEmits<{ success: []; error: [] }>();

const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const folderName = ref('');

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const resetName = () => {
  folderName.value = '';
}

const handleCreate = async () => {
  const data = {
    name: folderName.value,
  }
  try {
    await createSprintFolder(
      currentWorkspaceSlug.value ?? '',
      data,
    );
  } catch {
    showNotification('error', 'Ошибка при создании папки');
    return;
  }

  showNotification('success', 'Папка создана');
  resetName();
  emits('success');
};
</script>
