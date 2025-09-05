<template>
  <div>
    <h3 class="q-mt-md q-mb-md">Настройки уведомлений</h3>
    <p class="col">
      При деактивации параметра блокирует все уведомления данного типа, включая
      проектные настройки.
    </p>
    <q-list style="width: 150px">
      <q-item
        class="items-center justify-between"
        v-for="el in toggles"
        :key="el.title"
      >
        {{ el.title }}
        <q-toggle
          :model-value="el.value"
          size="32px"
          @update:model-value="el.update"
        />
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { TypesUserSettings } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useNotificationStore } from 'src/stores/notification-store';
import { SUCCESS_UPDATE_DATA, BASE_ERROR } from 'src/constants/notifications';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const { setNotificationView } = useNotificationStore();

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const changeNotificationSettings = async (data: TypesUserSettings) => {
  await userStore
    .updateCurrentUser({
      settings: {
        ...user.value?.settings,
        ...data,
      },
    })
    .then(() => showNotification('success', SUCCESS_UPDATE_DATA))
    .catch(() => showNotification('error', BASE_ERROR));
};

const toggleConfig = [
  { title: 'Email', key: 'email_notification_mute' as const },
  { title: 'Telegram', key: 'telegram_notification_mute' as const },
  { title: 'Система', key: 'app_notification_mute' as const },
];

const toggles = computed(() =>
  toggleConfig.map((el) => ({
    title: el.title,
    value: !user.value?.settings?.[el.key],
    update: (newValue: boolean) =>
      changeNotificationSettings({ [el.key]: !newValue }),
  })),
);
</script>
