<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">{{ activeStatus.title }} пользователя</h6>
        <span>
          {{ `Вы действительно хотите ${activeStatus.active} пользователя` }}
          {{ user?.email }}?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <q-btn
          flat
          no-caps
          class="btn"
          :class="activeStatus.btn_class"
          :label="
            activeStatus.active.charAt(0).toUpperCase() +
            activeStatus.active.slice(1)
          "
          v-close-popup
          @click="handleUpdateUser"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { isActive } from '../utils/active';
import { api } from '../services/api';

import CancelButton from 'src/components/buttons/CancelButton.vue';

const props = defineProps<{ user: DtoUserLight }>();
const emits = defineEmits<{ success: []; error: [] }>();

const activeStatus = computed(() => {
  if (isActive(props.user)) {
    return {
      value: true,
      title: 'Блокировка',
      active: 'заблокировать',
      btn_class: 'secondary-negative-btn',
    };
  } else {
    return {
      true: false,
      title: 'Разблокировка',
      active: 'разблокировать',
      btn_class: 'positive-btn',
    };
  }
});

const handleUpdateUser = async () => {
  api
    .updateUser(props.user.id ?? '', { is_active: !activeStatus.value.value })
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>
