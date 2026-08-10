import { reactive, ref, watch, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

import {
  NOTIFICATION_CHANNELS,
  hoursToNanoseconds,
  nanosecondsToHours,
} from '../../configs/notifications-settings.config';

import type {
  DtoUser,
  TypesUserSettings,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

type NotificationChannelKey = (typeof NOTIFICATION_CHANNELS)[number]['key'];

type UseFormNotificationsOptions = {
  user: Ref<DtoUser>;
  updateUser: (data: Partial<DtoUser>) => void;
};

export function useFormNotifications({
  user,
  updateUser,
}: UseFormNotificationsOptions) {
  const channels = reactive<Record<NotificationChannelKey, boolean>>({
    app_notification_mute: true,
    email_notification_mute: true,
    telegram_notification_mute: true,
  });
  const deadlineNotificationTime = ref(24);
  const pendingSettings = reactive<Partial<TypesUserSettings>>({});
  const saving = ref(false);

  const syncSettings = (settings?: TypesUserSettings) => {
    NOTIFICATION_CHANNELS.forEach(({ key }) => {
      channels[key] = !settings?.[key];
    });
    deadlineNotificationTime.value = nanosecondsToHours(
      settings?.deadline_notification,
    );
  };

  const changeNotificationSettings = async (
    settings: Partial<TypesUserSettings>,
  ) => {
    saving.value = true;
    try {
      const updatedSettings = {
        ...user.value.settings,
        ...settings,
      };

      // await userStore.updateCurrentUser({ settings: updatedSettings }); // TODO: подключить после настройки авторизации.
      updateUser({ settings: updatedSettings });
      // TODO: показать уведомление SUCCESS_UPDATE_DATA после переноса системы уведомлений.
    } catch (error) {
      void error;
      syncSettings(user.value.settings);
      // TODO: показать уведомление BASE_ERROR после переноса системы уведомлений.
    } finally {
      saving.value = false;
    }
  };

  const flushChannelUpdates = useDebounceFn(async () => {
    const changes = { ...pendingSettings };
    Object.keys(pendingSettings).forEach((key) => {
      delete pendingSettings[key as keyof TypesUserSettings];
    });

    if (Object.keys(changes).length) {
      await changeNotificationSettings(changes);
    }
  }, 1000);

  const updateChannel = (key: NotificationChannelKey, enabled: boolean) => {
    pendingSettings[key] = !enabled;
    flushChannelUpdates();
  };

  const updateDeadlineNotification = () => {
    changeNotificationSettings({
      deadline_notification: hoursToNanoseconds(deadlineNotificationTime.value),
    });
  };

  watch(() => user.value.settings, syncSettings, {
    deep: true,
    immediate: true,
  });

  return {
    channels,
    deadlineNotificationTime,
    saving,
    updateChannel,
    updateDeadlineNotification,
  };
}
