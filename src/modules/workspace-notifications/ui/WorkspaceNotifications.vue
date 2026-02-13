<template>
  <WorkspaceNotificationsButton
    :count="unreadNotificationsCount"
    :is-show="!isShowList"
  >
    <WorkspaceNotificationsListDialog
      v-model="isShowList"
      :unread-notifications="unreadNotifications"
      :read-notifications="readNotifications"
      :has-more-unread="hasMoreUnread"
      :has-more-read="hasMoreRead"
      @create="() => (isCreateOpen = true)"
      @update="getNotifications"
      @read="readAllNotifications"
      @hide="onHide"
      @load-more="loadMore"
    />
  </WorkspaceNotificationsButton>
  <WorkspaceNotificationsCreateDialog v-model="isCreateOpen" />
</template>

<script setup lang="ts">
//core
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
// stores
import { useNotificationStore } from 'src/stores/notification-store';
// utils
import { useWebSocket } from 'src/utils/useWebSocket';
// services
import {
  checkedUserNotifications,
  getUserNotifications,
} from 'src/modules/workspace-notifications/services/api';
// interfaces
import { NotificationsNotificationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
// components
import WorkspaceNotificationsCreateDialog from 'src/modules/workspace-notifications/ui/dialogs/WorkspaceNotificationsCreateDialog.vue';
import WorkspaceNotificationsButton from 'src/modules/workspace-notifications/ui/WorkspaceNotificationsButton.vue';
import WorkspaceNotificationsListDialog from 'src/modules/workspace-notifications/ui/dialogs/WorkspaceNotificationsListDialog.vue';

// TODO убрать в env
const wsUrl = `wss://${window.location.hostname}/api/auth/ws/notifications/`;
const ws = useWebSocket(wsUrl);
const { messages } = ws;

const { setNotificationView } = useNotificationStore();
const $q = useQuasar();

const isCreateOpen = ref<boolean>(false);
const isShowList = ref<boolean>(false);

const userNotifications = ref<NotificationsNotificationResponse[]>([]);
const hasMoreUnread = ref<boolean>(true);
const hasMoreRead = ref<boolean>(true);
const INITIAL_LIMIT = 100;
const LOAD_MORE_LIMIT = 50;

const notifications = computed<NotificationsNotificationResponse[]>(() => {
  return [...messages.value, ...userNotifications.value];
});

const unreadNotifications = computed<NotificationsNotificationResponse[]>(
  () => {
    return notifications.value.filter((notification) => !notification.viewed);
  },
);

const readNotifications = computed<NotificationsNotificationResponse[]>(() => {
  return notifications.value.filter((notification) => notification.viewed);
});

const unreadNotificationsCount = computed<number>(() =>
  unreadNotifications.value.length > 100
    ? 100
    : unreadNotifications.value.length,
);

const readAllNotifications = async (): Promise<void> => {
  await checkedUserNotifications({
    viewed_all: true,
  })
  await getNotifications();
};

const getNotifications = async (): Promise<void> => {
  hasMoreUnread.value = true;
  hasMoreRead.value = true;
  userNotifications.value = await getUserNotifications({ limit: INITIAL_LIMIT, offset: 0 });
};

const loadMore = async (type: 'unread' | 'read'): Promise<void> => {
  const isUnread = type === 'unread';
  const offset = userNotifications.value.length;

  const newNotifications = await getUserNotifications({ 
    limit: LOAD_MORE_LIMIT, 
    offset 
  });

  if (!newNotifications.length) {
    if (isUnread) {
      hasMoreUnread.value = false;
    } else {
      hasMoreRead.value = false;
    }
    return;
  }

  const hasNewNotificationsOfType = newNotifications.some(n => 
    isUnread ? !n.viewed : n.viewed
  );

  if (!hasNewNotificationsOfType) {
    if (isUnread) {
      hasMoreUnread.value = false;
    } else {
      hasMoreRead.value = false;
    }
    return;
  }

  userNotifications.value = [...userNotifications.value, ...newNotifications];
};

const wsParser = (event: any) => {
  const data = JSON.parse(event.data);
  const newMessage = {
    ...data,
    viewed: false,
  };
  if (newMessage.type === 'message') {
    setNotificationView({
      open: true,
      type: 'message',
      customTitle: newMessage.data.title,
      customMessage: newMessage.data.msg,
    });
  }
  return newMessage;
};

const onHide = () => {
  getNotifications();
  ws.clear();
};

onMounted(async () => {
  ws.connect(wsParser);
  getNotifications();
});

onUnmounted(() => {
  ws.disconnect();
});

watch(
  () => $q.appVisible,
  async (onVision) => {
    if (onVision) {
      ws.clear();
      getNotifications();
    }
  },
);
</script>
