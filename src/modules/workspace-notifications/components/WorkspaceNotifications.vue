<template>
  <v-menu
    v-model="isOpen"
    location="bottom end"
    :close-on-content-click="false"
    offset="4"
    :content-class="{ 'max-w-full! w-[100vw]! left-0!': mobile }"
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
      :is-mobile="mobile"
      class="h-auto max-h-[75vh] w-xl text-default"
      :class="{ 'w-full!': mobile }"
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
import { useUserStore } from '@/stores/user-store.ts';
import { useNotificationsController } from '../composables';
import { CreateWorkspaceNotificationDialog } from '../dialogs';
import NotificationsButton from './NotificationsButton.vue';
import NotificationsList from './NotificationsList.vue';
import NotificationsMenu from './NotificationsMenu.vue';

const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const { workspaceRoleName } = storeToRefs(useUserStore());

const { mobile } = useDisplay();
const isCreateOpen = ref(false);

const canCreateNotification = computed(
  () =>
    !!currentWorkspaceSlug.value &&
    ['admin', 'owner'].includes(workspaceRoleName.value),
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
