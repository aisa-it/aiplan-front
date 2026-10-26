<template>
  <div
    :data-id="notification.id"
    class="mb-3 flex items-start gap-2 rounded-lg border border-border p-2"
    :class="{ 'text-secondary': notification.viewed }"
    @click="onRead"
  >
    <span
      v-if="!notification.viewed"
      class="mt-2 size-2 shrink-0 rounded-full"
      :class="isMessage ? 'bg-error' : 'bg-info'"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <p class="m-0 font-semibold">{{ presentation.title }}</p>
        <p class="m-0 shrink-0 text-sm">{{ presentation.workspaceName }}</p>
      </div>

      <div class="mt-1 flex items-start justify-between gap-3">
        <p class="m-0 min-w-0 wrap-break-word">
          <span v-if="presentation.actorName" class="font-semibold">
            {{ presentation.actorName
            }}{{ usesActivityActorSeparator ? ' ' : ': ' }}
          </span>
          <NotificationMessage :parts="presentation.parts" />
        </p>

        <v-tooltip v-if="!notification.viewed" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              aria-label="Пометить как прочитанное"
              class="shrink-0 text-center"
              icon
              size="32"
              variant="outlined"
              color="text"
              :disabled="isMarkingAsRead"
              @click.stop="onRead"
            >
              <span class="material-symbols-rounded size-4.5 text-[18px]!"
                >domain_verification</span
              >
            </v-btn>
          </template>

          Пометить как прочитанное
        </v-tooltip>
      </div>

      <p class="m-0 mt-1 text-right text-sm">
        {{ formattedCreatedAt }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from '@/stores/user-store';
import { formatDateTime } from '@/utils/time';
import type { WorkspaceNotification } from '../models';
import { getNotificationPresentation } from '../renders';
import NotificationMessage from './NotificationMessage.vue';

const props = defineProps<{
  isMarkingAsRead: boolean;
  notification: WorkspaceNotification;
}>();

const emit = defineEmits<{
  read: [id: string];
}>();

const { user } = storeToRefs(useUserStore());

const presentation = computed(() =>
  getNotificationPresentation(props.notification),
);

const usesActivityActorSeparator = computed(
  () => props.notification.type === 'activity',
);

const isMessage = computed(
  () =>
    props.notification.type === 'message' ||
    props.notification.type === 'service_message',
);

const formattedCreatedAt = computed(() =>
  props.notification.created_at
    ? formatDateTime(props.notification.created_at, user.value?.user_timezone)
    : '',
);

const onRead = () => {
  if (props.notification.viewed || props.isMarkingAsRead) return;

  emit('read', props.notification.id);
};
</script>
