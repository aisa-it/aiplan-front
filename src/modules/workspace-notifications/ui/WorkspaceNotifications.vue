<template>
  <WorkspaceNotificationsButton
    :count="unreadNotificationsCount"
    :is-show="!isShowList"
  >
    <WorkspaceNotificationsListDialog
      v-model="isShowList"
      :unread-notifications="unreadNotifications"
      :read-notifications="readNotifications"
      @create="() => (isCreateOpen = true)"
      @update="getNotifications"
      @read="readAllNotifications"
      @hide="onHide"
      @load="lazyLoadNotifications"
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

const offset = ref(0);
const notificationsCount = ref(0);

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
  offset.value = 0;
  await checkedUserNotifications({
    viewed_all: true,
  });
  await getNotifications();
};

const getNotifications = async (): Promise<void> => {
  const { count, result } = await getUserNotifications();
  notificationsCount.value = count ?? 0;
  userNotifications.value = result;
};

const lazyLoadNotifications = async () => {
  offset.value += 100;
  if (offset.value < notificationsCount.value) {
    const { count, result } = await getUserNotifications({
      offset: offset.value,
    });
    notificationsCount.value = count ?? 0;
    userNotifications.value = [...userNotifications.value, ...result];
  }
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
  offset.value = 0;
  getNotifications();
  ws.clear();
};

onMounted(async () => {
  offset.value = 0;
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
