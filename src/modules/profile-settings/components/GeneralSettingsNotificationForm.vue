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

    <div class="deadline-notification">
      <p class="deadline-notification__label">
        Выберите за сколько вы хотите получать уведомление об истечении срока
        задачи
      </p>
      <q-select
        v-model="deadlineNotificationTime"
        :options="notificationOptions"
        class="deadline-notification__select q-field__native base-selector"
        emit-value
        map-options
        option-value="hours"
        option-label="text"
        dense
        @update:model-value="
          changeNotificationSettings({
            deadline_notification: hoursToNanoseconds(deadlineNotificationTime),
          })
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { TypesUserSettings } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useNotificationStore } from 'src/stores/notification-store';
import { SUCCESS_UPDATE_DATA, BASE_ERROR } from 'src/constants/notifications';
import {
  hoursToNanoseconds,
  nanosecondsToHours,
} from 'src/utils/hoursToNanoseconds';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const { setNotificationView } = useNotificationStore();

const notificationOptions: {
  text: string;
  hours: number;
}[] = [
  { text: 'Никогда', hours: 0 },
  { text: '1 час', hours: 1 },
  { text: '2 часа', hours: 2 },
  { text: '3 часа', hours: 3 },
  { text: '4 часа', hours: 4 },
  { text: '5 часов', hours: 5 },
  { text: '6 часов', hours: 6 },
  { text: '1 день', hours: 24 },
  { text: '2 дня', hours: 48 },
  { text: '3 дня', hours: 72 },
];

const deadlineNotificationTime = ref<number>(
  user.value?.settings?.deadline_notification
    ? nanosecondsToHours(user.value?.settings?.deadline_notification)
    : 24,
);

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

watch(
  () => user.value?.settings?.deadline_notification,
  (newValue) => {
    if (newValue !== undefined) {
      deadlineNotificationTime.value = nanosecondsToHours(newValue);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.deadline-notification {
  margin-top: 10px;

  &__label {
    margin: 0;
  }

  &__select {
    margin: 10px 0 0 16px;
    max-width: 168px;
  }
}
</style>
