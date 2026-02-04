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
    />
  </WorkspaceNotificationsButton>
  <WorkspaceNotificationsCreateDialog v-model="isCreateOpen" />
</template>

<script setup lang="ts">
//core
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';
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

const { setNotificationView } = useNotificationStore();

const isCreateOpen = ref<boolean>(false);
const isShowList = ref<boolean>(false);
const unreadNotificationsCount = ref(0);

const userNotifications = shallowRef<NotificationsNotificationResponse[]>([]);

const unreadNotifications = computed<NotificationsNotificationResponse[]>(
  () => {
    return userNotifications.value.filter(
      (notification) => !notification.viewed,
    );
  },
);

const readNotifications = computed<NotificationsNotificationResponse[]>(() => {
  return userNotifications.value.filter((notification) => notification.viewed);
});

const readAllNotifications = async (): Promise<void> => {
  await checkedUserNotifications({
    viewed_all: true,
  });
  await getNotifications();
};

const getNotifications = async (): Promise<void> => {
  userNotifications.value = await getUserNotifications();
  unreadNotificationsCount.value = Math.min(
    unreadNotifications.value.length,
    100,
  );
};

const hasNewNotifications = ref(false);

const wsParser = (event: any) => {
  const data = JSON.parse(event.data);

  if (data?.type !== 'message') return;

  unreadNotificationsCount.value = Math.min(
    unreadNotificationsCount.value + 1,
    100,
  );

  setNotificationView({
    open: true,
    type: 'message',
    customTitle: data.data.title,
    customMessage: data.data.msg,
  });

  if (isShowList.value) {
    getNotifications();
  } else {
    hasNewNotifications.value = true;
  }
};

onMounted(async () => {
  ws.connect(wsParser);
  getNotifications();
});

onUnmounted(() => {
  ws.disconnect();
});

watch(isShowList, async (open) => {
  if (open && hasNewNotifications.value) {
    await getNotifications();
    hasNewNotifications.value = false;
  }
});
</script>
