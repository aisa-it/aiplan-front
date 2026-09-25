import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
} from 'vue';

import { NotificationsService } from '../api';
import type { NotificationTab, WorkspaceNotification } from '../models';
import { useNotificationsSocket } from './useNotificationsSocket';

const INITIAL_LIMIT = 100;
const LOAD_MORE_LIMIT = 50;
const MAX_UNREAD_COUNT = 100;
const SOCKET_REFRESH_DELAY = 300;

const countUnreadNotifications = (
  notifications: WorkspaceNotification[],
) =>
  Math.min(
    notifications.filter((notification) => !notification.viewed).length,
    MAX_UNREAD_COUNT,
  );

export function useNotificationsController() {
  const activeTab = ref<NotificationTab>('unread');
  const hasMoreRead = ref(true);
  const hasMoreUnread = ref(true);
  const hasNewNotifications = ref(false);
  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const isOpen = ref(false);
  const notifications = shallowRef<WorkspaceNotification[]>([]);
  const unreadCount = ref(0);

  let listRevision = 0;
  let refreshTimer: number | undefined;

  const unreadNotifications = computed(() =>
    notifications.value.filter((notification) => !notification.viewed),
  );

  const readNotifications = computed(() =>
    notifications.value.filter((notification) => notification.viewed),
  );

  const resetPagination = () => {
    hasMoreRead.value = true;
    hasMoreUnread.value = true;
  };

  const clearRefreshTimer = () => {
    if (refreshTimer === undefined) return;

    window.clearTimeout(refreshTimer);
    refreshTimer = undefined;
  };

  const clearNotifications = () => {
    listRevision += 1;
    clearRefreshTimer();
    notifications.value = [];
    isLoading.value = false;
    isLoadingMore.value = false;
    resetPagination();
  };

  const syncUnreadCount = async () => {
    try {
      const result = await NotificationsService.getNotifications({
        limit: INITIAL_LIMIT,
        offset: 0,
      });

      unreadCount.value = countUnreadNotifications(result);
    } catch {
      // TODO: показать ошибку после переноса системы уведомлений.
    }
  };

  const loadNotifications = async () => {
    const revision = ++listRevision;

    isLoading.value = true;
    resetPagination();

    try {
      const result = await NotificationsService.getNotifications({
        limit: INITIAL_LIMIT,
        offset: 0,
      });

      if (revision !== listRevision || !isOpen.value) return;

      notifications.value = result;
      unreadCount.value = countUnreadNotifications(result);
      hasNewNotifications.value = false;
    } catch {
      // TODO: показать ошибку после переноса системы уведомлений.
    } finally {
      if (revision === listRevision) {
        isLoading.value = false;
      }
    }
  };

  const loadMore = async (type: NotificationTab) => {
    if (isLoadingMore.value || !isOpen.value) return;

    const isUnread = type === 'unread';
    const revision = listRevision;

    isLoadingMore.value = true;

    try {
      const result = await NotificationsService.getNotifications({
        limit: LOAD_MORE_LIMIT,
        offset: notifications.value.length,
      });

      if (revision !== listRevision || !isOpen.value) return;

      if (!result.length) {
        if (isUnread) hasMoreUnread.value = false;
        else hasMoreRead.value = false;
        return;
      }

      const hasNotificationsOfType = result.some((notification) =>
        isUnread ? !notification.viewed : notification.viewed,
      );

      if (!hasNotificationsOfType) {
        if (isUnread) hasMoreUnread.value = false;
        else hasMoreRead.value = false;
        return;
      }

      notifications.value = [...notifications.value, ...result];
    } catch {
      // TODO: показать ошибку после переноса системы уведомлений.
    } finally {
      if (revision === listRevision) {
        isLoadingMore.value = false;
      }
    }
  };

  const scheduleNotificationsRefresh = () => {
    if (refreshTimer !== undefined) return;

    refreshTimer = window.setTimeout(() => {
      refreshTimer = undefined;
      void loadNotifications();
    }, SOCKET_REFRESH_DELAY);
  };

  const handleSocketMessage = () => {
    // TODO: показывать сообщения типа message после переноса toast-уведомлений.
    unreadCount.value = Math.min(
      unreadCount.value + 1,
      MAX_UNREAD_COUNT,
    );

    if (isOpen.value) {
      scheduleNotificationsRefresh();
      return;
    }

    hasNewNotifications.value = true;
  };

  const socket = useNotificationsSocket({
    onMessage: handleSocketMessage,
    onOpen: ({ isReconnect }) => {
      if (!isReconnect) return;

      hasNewNotifications.value = true;

      if (isOpen.value) void loadNotifications();
      else void syncUnreadCount();
    },
  });

  watch(isOpen, (open) => {
    if (open) {
      void loadNotifications();
      return;
    }

    clearNotifications();
  });

  onMounted(() => {
    socket.connect();
    void syncUnreadCount();
  });

  onScopeDispose(() => {
    clearNotifications();
  });

  return {
    activeTab,
    hasMoreRead,
    hasMoreUnread,
    hasNewNotifications,
    isLoading,
    isLoadingMore,
    isOpen,
    loadMore,
    notifications,
    readNotifications,
    socketStatus: socket.status,
    unreadCount,
    unreadNotifications,
  };
}
