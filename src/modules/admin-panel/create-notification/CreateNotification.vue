<template>
  <AdminHeader :title="'Создать уведомление'" />
  <CreateNotificationForm @send="handleSend" />
</template>

<script lang="ts" setup>
import { useNotificationStore } from 'src/stores/notification-store';
import {
  SUCCESS_SEND_NOTIFICATION,
  ERROR_SEND_NOTIFICATION,
} from 'src/constants/notifications';

import AdminHeader from '../ui/AdminHeader.vue';

import CreateNotificationForm from './components/CreateNotificationForm.vue';
import { AiplanRequestMessage } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { api } from './services/api';

const { setNotificationView } = useNotificationStore();

const handleSend = async (
  form: AiplanRequestMessage,
  resetForm: () => void,
) => {
  try {
    await api.createMessage(form);
    resetForm();
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_SEND_NOTIFICATION,
    });
  } catch (err) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: ERROR_SEND_NOTIFICATION,
    });
  }
};
</script>

<style scoped lang="scss">
.admin-header {
  margin-top: 8px;
}
</style>
