<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление тега</h6>

        <span class="full-w word-wrap">
          Вы уверены, что хотите удалить тег
          <b>"{{ current_label?.name }}"</b>?
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
          @click="handleDeletion"
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
import { useNotificationStore } from 'src/stores/notification-store';

// constans
import { SUCCESS_DELETE_TAG } from 'src/constants/notifications';

// interfaces
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { deleteProjectLabel } from '../../services/api';

const props = defineProps<{
  currentLabel?: DtoLabelLight;
}>();
// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const { currentLabel: current_label } = toRefs(props);

const onClose = (type: 'error' | 'success', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const handleDeletion = async () => {
  await deleteProjectLabel(
    currentWorkspaceSlug.value as string,
    project.value.id,
    current_label?.value?.id as string,
  ).then(async () => {
    await projectStore.getProjectLabels(
      currentWorkspaceSlug.value as string,
      project.value.id,
    );
    onClose('success', SUCCESS_DELETE_TAG);
  });
};
</script>
