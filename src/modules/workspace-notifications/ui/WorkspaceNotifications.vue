<template>
  <template v-if="!isDialog" >
    <WorkspaceNotificationsButton
      :count="unreadNotificationsCount"
      :is-show="!isShowList"
      :is-mobile="isMobile"
    >
      <WorkspaceNotificationsListDialog
        v-if="!isMobile"
        v-model="isShowList"
        :unread-notifications="unreadNotifications"
        :read-notifications="readNotifications"
        :has-more-unread="hasMoreUnread"
        :has-more-read="hasMoreRead"
        @create="() => (isCreateOpen = true)"
        @update="getNotifications"
        @read="readAllNotifications"
        @load-more="loadMore"
        @hide="onHide"
      />
    </WorkspaceNotificationsButton>
  </template>
  <template v-else>
    <WorkspaceNotificationsListDialog
      v-model="isShowList"
      :unread-notifications="unreadNotifications"
      :read-notifications="readNotifications"
      :has-more-unread="hasMoreUnread"
      :has-more-read="hasMoreRead"
      :is-show-list="isShowList"
      @create="() => (isCreateOpen = true)"
      @update="getNotifications"
      @read="readAllNotifications"
      @load-more="loadMore"
      @hide="onHide"
    />
  </template>
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

const props = defineProps<{
  showDialog?: boolean;
  isDialog?: boolean;
  isMobile?: boolean;
}>();

const emit = defineEmits(['closeDialog']);

const isCreateOpen = ref<boolean>(false);
const isShowList = ref<boolean>(false);
const unreadNotificationsCount = ref(0);

const hasMoreUnread = ref<boolean>(true);
const hasMoreRead = ref<boolean>(true);
const INITIAL_LIMIT = 100;
const LOAD_MORE_LIMIT = 50;

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
  hasMoreUnread.value = true;
  hasMoreRead.value = true;
  userNotifications.value = await getUserNotifications({
    limit: INITIAL_LIMIT,
    offset: 0,
  });
  unreadNotificationsCount.value = Math.min(
    unreadNotifications.value.length,
    100,
  );
};

const onHide = () => {
  userNotifications.value = [...userNotifications.value].slice(
    0,
    INITIAL_LIMIT,
  );
  hasMoreUnread.value = true;
  hasMoreRead.value = true;
  emit('closeDialog');
};

const hasNewNotifications = ref(false);

const loadMore = async (type: 'unread' | 'read'): Promise<void> => {
  const isUnread = type === 'unread';
  const offset = userNotifications.value.length;

  const newNotifications = await getUserNotifications({
    limit: LOAD_MORE_LIMIT,
    offset,
  });

  if (!newNotifications.length) {
    if (isUnread) {
      hasMoreUnread.value = false;
    } else {
      hasMoreRead.value = false;
    }
    return;
  }

  const hasNewNotificationsOfType = newNotifications.some((n) =>
    isUnread ? !n.viewed : n.viewed,
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

  unreadNotificationsCount.value = Math.min(
    unreadNotificationsCount.value + 1,
    100,
  );

  if (data?.type === 'message') {
    setNotificationView({
      open: true,
      type: 'message',
      customTitle: data.data.title,
      customMessage: data.data.msg,
    });
  }

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

watch(() => props.showDialog, () => {
  isShowList.value = props.showDialog;
});
</script>
