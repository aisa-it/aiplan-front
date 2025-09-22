<template>
  <div
    class="flex row justify-between no-wrap full-width workspace-notification__item"
    :class="{ 'text-showed': isShowed }"
    :data-id="notificationRow.id"
    @click="readNotification"
  >
    <div
      v-if="!isShowed"
      class="flex items-center q-mr-sm"
      style="width: 16px; height: 23px"
    >
      <q-badge rounded :color="isMessage ? 'red' : 'info'"></q-badge>
    </div>
    <div class="full-width">
      <div class="q-mx-sm flex justify-between full-width no-wrap">
        <p class="text-bold q-mb-none body-1-medium">
          {{ title }}
        </p>
        <p class="q-mb-none body-2">
          {{ props.notificationRow?.detail?.workspace?.name }}
        </p>
      </div>
      <div class="notification-content body-1 q-mt-xs word-wrap full-width">
        <p class="notification-text">
          <span
            v-if="props.notificationRow?.detail?.user"
            class="notification-username"
          >
            {{
              getFullName(props.notificationRow?.detail?.user) +
              (props.notificationRow?.type === 'activity' ? ' ' : ': ')
            }}
          </span>
          <span
            :class="['word-wrap', { 'text-showed': isShowed }]"
            v-html="transform()"
          ></span>
        </p>
        <div v-if="!isShowed" class="q-ml-md">
          <q-btn class="btn-only-icon-sm bordered" @click="readNotification">
            <q-icon name="domain_verification" />
            <HintTooltip> Пометить как прочитанное </HintTooltip>
          </q-btn>
        </div>
      </div>
      <div class="flex justify-end full-width">
        <p class="q-mb-none body-2">
          {{
            formatDateTime(
              props.notificationRow?.created_at ?? '',
              user.user_timezone,
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
//stores
import { useUserStore } from 'src/stores/user-store';
//utils
import { formatDateTime } from 'src/utils/time';
import { issueNotificationRender } from '../utils/issue-notification';
import { projectNotificationRender } from '../utils/project-notification';
import { getFullName } from 'src/utils/helpers';
import { messageNotificationRender } from '../utils/message-notification';
// interfaces
import { NotificationsNotificationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
// services
import { checkedUserNotifications } from 'src/modules/workspace-notifications/services/api';
import { docNotificationRender } from '../utils/doc-notification';
import { workspaceNotificationRender } from '../utils/workspace-notification';

const props = defineProps<{
  notificationRow: NotificationsNotificationResponse;
  isShowed?: boolean;
}>();
const emits = defineEmits<{ getNotifications: [] }>();

//stores
const userStore = useUserStore();

//storesToRefs
const { user } = storeToRefs(userStore);

//computeds
const isMessage = computed(
  () =>
    props.notificationRow?.type === 'message' ||
    props.notificationRow?.type === 'service_message',
);

const title = computed(() => {
  if (isMessage.value) return props.notificationRow?.data?.title;
  if (
    props.notificationRow?.data.entity_type === 'doc' ||
    props.notificationRow?.data.field === 'doc'
  )
    return 'АИДок';

  return props.notificationRow?.detail?.project?.name;
});

//methods
async function readNotification() {
  await checkedUserNotifications({
    ids: [props.notificationRow.id ?? ''],
    viewed_all: false,
  });
  emits('getNotifications');
}

function transform() {
  if (
    props.notificationRow?.type === 'message' ||
    props.notificationRow?.type === 'service_message'
  ) {
    return messageNotificationRender(
      props.notificationRow?.data,
      props.notificationRow?.detail,
    );
  }
  if (
    props.notificationRow?.type === 'activity' ||
    props.notificationRow?.type === 'comment'
  ) {
    if (props.notificationRow?.data?.field === 'start_date') {
      return 'начал(-а) выполнение задачи';
    }
    if (props.notificationRow?.data?.field === 'completed_at') {
      return 'завершил(-а) задачу';
    }
    if (
      props.notificationRow?.data?.entity_type === 'issue' ||
      props.notificationRow?.type === 'comment'
    ) {
      return issueNotificationRender(
        props.notificationRow?.data,
        props.notificationRow?.detail,
      );
    }

    if (props.notificationRow?.data?.entity_type === 'workspace') {
      return workspaceNotificationRender(
        props.notificationRow?.data,
        props.notificationRow?.detail ?? {},
      );
    }
    if (props.notificationRow?.data?.entity_type === 'project') {
      return projectNotificationRender(
        props.notificationRow?.data,
        props.notificationRow?.detail,
      );
    }
    if (props.notificationRow?.data?.entity_type === 'doc') {
      return docNotificationRender(
        props.notificationRow?.data,
        props.notificationRow?.detail,
      );
    }
  }
  return '';
}
</script>

<style lang="scss" scoped>
.text-showed {
  color: #8b8b98;
}

.notification {
  &-content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  &-text {
    margin: 0;
  }
  &-username {
    font-weight: 600;
  }
}
</style>
