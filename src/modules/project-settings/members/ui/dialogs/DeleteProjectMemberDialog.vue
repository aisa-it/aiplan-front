<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление пользователя</h6>
        <span>
          Вы действительно хотите удалить
          <b>{{ choosed_user?.member?.email }}</b> из проекта?
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          style="width: 100px"
          @click="handleDeleteUser"
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

import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { deleteProjectMember } from '../../services/api';

const props = defineProps<{
  user?: DtoProjectMemberLight;
}>();

const emits = defineEmits<{
  delete: [];
  error: [];
}>();

// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

// stores to refs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { currentProjectID } = storeToRefs(projectStore);

// vars
const { user: choosed_user } = toRefs(props);

const handleDeleteUser = async () => {
  await deleteProjectMember(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
    choosed_user?.value?.id as string,
  )
    .then(() => emits('delete'))
    .catch(() => emits('error'));
};
</script>
