<template>
  <section class="pt-4" aria-labelledby="notifications-heading">
    <h3 id="notifications-heading" class="text-2xl font-medium">
      Настройки уведомлений
    </h3>
    <p class="mt-4">
      При деактивации параметра блокирует все уведомления данного типа, включая
      проектные настройки.
    </p>

    <div class="mt-4 w-[150px]">
      <div
        v-for="channel in NOTIFICATION_CHANNELS"
        :key="channel.key"
        class="flex min-h-12 items-center justify-between"
      >
        <span>{{ channel.title }}</span>
        <v-switch
          v-model="channels[channel.key]"
          color="primary"
          hide-details
          :disabled="saving"
          :aria-label="`Уведомления: ${channel.title}`"
          @update:model-value="
            (value) => updateChannel(channel.key, Boolean(value))
          "
        />
      </div>
    </div>

    <div class="mt-3">
      <p>
        Выберите за сколько вы хотите получать уведомление об истечении срока
        задачи
      </p>
      <v-select
        v-model="deadlineNotificationTime"
        class="ml-4 mt-3 max-w-[168px]"
        :items="DEADLINE_NOTIFICATION_OPTIONS"
        :disabled="saving"
        @update:model-value="updateDeadlineNotification"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

import {
  DEADLINE_NOTIFICATION_OPTIONS,
  NOTIFICATION_CHANNELS,
} from '../../configs/notifications-settings.config';
import { useFormNotifications } from '../../composables/general-profile-settings/useFormNotifications';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const user = toRef(props, 'user');

const {
  channels,
  deadlineNotificationTime,
  saving,
  updateChannel,
  updateDeadlineNotification,
} = useFormNotifications(user);
</script>
