<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление спринта</h6>
        <span>
          {{ `Вы действительно хотите удалить спринт` }}
          {{ sprint?.name }}
          {{
            getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '')
          }}?
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
          @click="handleDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { deleteSprint } from '../services/api';
import { useRoute } from 'vue-router';

import CancelButton from 'src/components/buttons/CancelButton.vue';

import { getSprintDates } from '../helpres';

const route = useRoute();

const props = defineProps<{ sprint: DtoSprint | null }>();
const emits = defineEmits<{ success: []; error: [] }>();

const handleDelete = async (): Promise<void> => {
  deleteSprint(route.params.workspace as string, props.sprint?.id ?? '')
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>
