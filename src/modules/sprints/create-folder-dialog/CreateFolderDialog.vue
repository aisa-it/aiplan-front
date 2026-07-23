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
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { createSprintFolder } from '../services/api';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSprintStore } from '../stores/sprint-store';
import { DtoSprintFolder } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import CancelButton from 'src/components/buttons/CancelButton.vue';

const emits = defineEmits<{ success: []; error: [] }>();

const { setNotificationView } = useNotificationStore();
const sprintStore = useSprintStore();
const { sprintsList } = storeToRefs(sprintStore);

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

const sameNameFolder = ref<DtoSprintFolder>();
const checkName = () => {
  sameNameFolder.value = sprintsList.value.find((folder) => {
    return folder.name?.toLowerCase() === folderName.value.toLowerCase();
  });
}

const handleCreate = async () => {
  checkName();

  if (sameNameFolder.value) {
    showNotification('error', 'Папка с таким именем уже существует');
    resetName();
    return;
  }

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
