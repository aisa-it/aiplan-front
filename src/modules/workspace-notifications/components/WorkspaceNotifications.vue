<template>
  <v-dialog v-if="isMobile" v-model="isOpen" fullscreen>
    <template #activator="{ props: activatorProps }">
      <NotificationsButton
        v-bind="activatorProps"
        :count="unreadCount"
        :show-badge="!isOpen"
      />
    </template>

    <NotificationsMenu
      :can-create="canCreateNotification"
      :has-notifications="hasNotifications"
      :is-loading="isLoading"
      is-mobile
      @close="isOpen = false"
      @create="isCreateOpen = true"
    >
      <NotificationsList
        v-model:active-tab="activeTab"
        :has-more-read="hasMoreRead"
        :has-more-unread="hasMoreUnread"
        :is-loading-more="isLoadingMore"
        :is-marking-all-as-read="isMarkingAllAsRead"
        :is-marking-as-read="isMarkingAsRead"
        :read-notifications="readNotifications"
        :unread-notifications="unreadNotifications"
        @load-more="loadMore"
        @read="markNotificationAsRead"
        @read-all="markAllNotificationsAsRead"
      />
    </NotificationsMenu>
  </v-dialog>

  <v-menu
    v-else
    v-model="isOpen"
    location="bottom end"
    :close-on-content-click="false"
    :offset="4"
  >
    <template #activator="{ props: activatorProps }">
      <NotificationsButton
        v-bind="activatorProps"
        :count="unreadCount"
        :show-badge="!isOpen"
      />
    </template>

    <NotificationsMenu
      :can-create="canCreateNotification"
      :has-notifications="hasNotifications"
      :is-loading="isLoading"
      class="h-auto max-h-[75vh] w-xl text-default"
      @create="isCreateOpen = true"
    >
      <NotificationsList
        v-model:active-tab="activeTab"
        :has-more-read="hasMoreRead"
        :has-more-unread="hasMoreUnread"
        :is-loading-more="isLoadingMore"
        :is-marking-all-as-read="isMarkingAllAsRead"
        :is-marking-as-read="isMarkingAsRead"
        :read-notifications="readNotifications"
        :unread-notifications="unreadNotifications"
        @load-more="loadMore"
        @read="markNotificationAsRead"
        @read-all="markAllNotificationsAsRead"
      />
    </NotificationsMenu>
  </v-menu>

  <CreateWorkspaceNotificationDialog
    v-if="currentWorkspaceSlug"
    v-model="isCreateOpen"
    :workspace-slug="currentWorkspaceSlug"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';

import { useWorkspaceStore } from '@/stores/workspace-store';
import { useNotificationsController } from '../composables';
import { CreateWorkspaceNotificationDialog } from '../dialogs';
import NotificationsButton from './NotificationsButton.vue';
import NotificationsList from './NotificationsList.vue';
import NotificationsMenu from './NotificationsMenu.vue';

const { width } = useDisplay();
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug, meInWorkspace } = storeToRefs(workspaceStore);

const isMobile = computed(() => width.value <= 768);
const isCreateOpen = ref(false);

const canCreateNotification = computed(
  () =>
    !!currentWorkspaceSlug.value &&
    (meInWorkspace.value.is_workspace_owner ||
      (meInWorkspace.value.role ?? 0) >= 15),
);

const {
  activeTab,
  hasMoreRead,
  hasMoreUnread,
  isLoading,
  isLoadingMore,
  isMarkingAllAsRead,
  isMarkingAsRead,
  isOpen,
  loadMore,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notifications,
  readNotifications,
  unreadCount,
  unreadNotifications,
} = useNotificationsController();

const hasNotifications = computed(() => notifications.value.length > 0);
</script>
