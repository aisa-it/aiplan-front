<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление статуса</h6>
        <span class="full-w word-wrap">
          Вы уверены, что хотите удалить статус
          <b>"{{ current_state?.name }}"</b>?
        </span>
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
          @click="handleDeleteState"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { toRefs } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// constants
import { BASE_ERROR, SUCCESS_DELETE_STATE } from 'src/constants/notifications';

// interfaces
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { deleteState } from '../../services/api';

const props = defineProps<{
  currentState?: DtoStateLight;
}>();
const emits = defineEmits<{
  error: [value: string];
  success: [value: string];
}>();

// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

// stores to ref
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { currentProjectID } = storeToRefs(projectStore);

// vars
const { currentState: current_state } = toRefs(props);

const handleDeleteState = async () => {
  await deleteState(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
    current_state?.value?.id as string,
  )
    .then(() => emits('success', SUCCESS_DELETE_STATE))
    .catch(() => emits('error', BASE_ERROR));
};
</script>
