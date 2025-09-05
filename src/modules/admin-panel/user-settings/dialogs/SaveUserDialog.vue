<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Сохранение изменений</h6>
        <div class="q-mt-md">
          <b> Вы уверены, что хотите сохранить изменения? </b>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <SaveButton v-close-popup @click="handleUpdateUser" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import CancelButton from 'src/components/buttons/CancelButton.vue';
import SaveButton from 'src/components/buttons/SaveButton.vue';

import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { api } from '../../services/api';

const props = defineProps<{ userInfo: DtoUserLight }>();

const emits = defineEmits<{ success: []; error: [] }>();
const handleUpdateUser = async () => {
  api
    .updateUser(props.userInfo.id || '', props.userInfo)
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>
