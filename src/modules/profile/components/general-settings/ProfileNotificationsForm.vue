<template>
  <section class="pt-4" aria-labelledby="notifications-heading">
    <h3 id="notifications-heading" class="text-2xl font-medium">
      {{ t('profile.notifications.heading') }}
    </h3>
    <p class="mt-4">{{ t('profile.notifications.description') }}</p>

    <div class="mt-4 w-[150px]">
      <div
        v-for="channel in NOTIFICATION_CHANNELS"
        :key="channel.key"
        class="flex min-h-12 items-center justify-between"
      >
        <span>{{ t(channel.labelKey) }}</span>
        <v-switch
          v-model="channels[channel.key]"
          color="primary"
          hide-details
          :disabled="saving"
          :aria-label="
            t('profile.notifications.channelAria', {
              channel: t(channel.labelKey),
            })
          "
          @update:model-value="
            (value) => updateChannel(channel.key, Boolean(value))
          "
        />
      </div>
    </div>

    <div class="mt-3">
      <p>{{ t('profile.notifications.deadlineDescription') }}</p>
      <v-select
        v-model="deadlineNotificationTime"
        class="ml-4 mt-3 max-w-[168px]"
        :items="deadlineNotificationOptions"
        :disabled="saving"
        @update:model-value="updateDeadlineNotification"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  DEADLINE_NOTIFICATION_OPTIONS,
  NOTIFICATION_CHANNELS,
} from '../../configs/notifications-settings.config';
import { useFormNotifications } from '../../composables/general-profile-settings/useFormNotifications';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const { t } = useI18n();

const user = toRef(props, 'user');

const deadlineNotificationOptions = computed(() =>
  DEADLINE_NOTIFICATION_OPTIONS.map((value) => ({
    value,
    title:
      value === 0
        ? t('common.states.never')
        : value < 24
          ? t('profile.notifications.deadline.hours', value)
          : t('profile.notifications.deadline.days', value / 24),
  })),
);

const {
  channels,
  deadlineNotificationTime,
  saving,
  updateChannel,
  updateDeadlineNotification,
} = useFormNotifications(user);
</script>
