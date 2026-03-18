<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление пространства</h6>
        <span>
          Вы действительно хотите удалить рабочее пространство
          <span class="text-weight-bold">{{ workspace?.name }}</span
          >?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <q-btn
          flat
          no-caps
          class="btn secondary-negative-btn"
          label="Удалить"
          v-close-popup
          @click="handleDeleteWorkspace"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//types
import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//services
import { api } from '../../services/api';

//components
import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{ workspace: DtoWorkspaceWithCount | undefined }>();
const emits = defineEmits<{ success: []; error: [] }>();

//methods
const handleDeleteWorkspace = async () => {
  if (!props.workspace?.slug) return;
  api
    .deleteWorkspace(props.workspace.slug)
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>
