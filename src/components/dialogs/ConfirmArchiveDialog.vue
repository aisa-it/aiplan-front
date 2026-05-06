<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">
          {{ isUnarchive ? 'Разархивировать' : 'Добавить в архив' }}
          {{ ` проект` }}
          {{ project?.name }}?
        </h6>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup style="width: 110px" />
        <q-btn
          flat
          no-caps
          class="btn primary-btn"
          :label="isUnarchive ? 'Разархивировать' : 'В архив'"
          :style="{ width: isUnarchive ? '210px' : '110px' }"
          v-close-popup
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{
  project: DtoProjectLight | null,
  isUnarchive?: boolean,
}>();
const emits = defineEmits<{ success: []; error: [] }>();

const workspaceStore = useWorkspaceStore();

const handleConfirm = async (): Promise<void> => {
  if (props.isUnarchive) {
    console.log('Убрать из архива');
    workspaceStore.setWorkspaceArchive(props.project?.id as string, true)
  } else {
    console.log('Добавить в архив');
    workspaceStore.setWorkspaceArchive(props.project?.id as string)
  }
};
</script>
