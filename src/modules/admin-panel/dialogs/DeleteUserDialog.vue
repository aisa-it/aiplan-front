<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление пользователя</h6>
        <span>
          {{ `Вы действительно хотите удалить пользователя` }}
          {{ user?.email }}?
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
          @click="handleDeleteUser"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { api } from '../services/api';

import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{ user: DtoUserLight | undefined }>();
const emits = defineEmits<{ success: []; error: [] }>();

const handleDeleteUser = async ():Promise<void> => {
  api
    .deleteUser(props.user?.id ?? '')
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>
