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
      :has-notifications="hasNotifications"
      :is-loading="isLoading"
      is-mobile
      @close="isOpen = false"
    >
      <NotificationsList
        v-model:active-tab="activeTab"
        :has-more-read="hasMoreRead"
        :has-more-unread="hasMoreUnread"
        :is-loading-more="isLoadingMore"
        :read-notifications="readNotifications"
        :unread-notifications="unreadNotifications"
        @load-more="loadMore"
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
      :has-notifications="hasNotifications"
      :is-loading="isLoading"
      class="h-auto max-h-[75vh] w-[576px] max-w-[calc(100vw-32px)]"
    >
      <NotificationsList
        v-model:active-tab="activeTab"
        :has-more-read="hasMoreRead"
        :has-more-unread="hasMoreUnread"
        :is-loading-more="isLoadingMore"
        :read-notifications="readNotifications"
        :unread-notifications="unreadNotifications"
        @load-more="loadMore"
      />
    </NotificationsMenu>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

import { useNotificationsController } from '../composables';
import NotificationsButton from './NotificationsButton.vue';
import NotificationsList from './NotificationsList.vue';
import NotificationsMenu from './NotificationsMenu.vue';

const { width } = useDisplay();
const isMobile = computed(() => width.value <= 768);

const {
  activeTab,
  hasMoreRead,
  hasMoreUnread,
  isLoading,
  isLoadingMore,
  isOpen,
  loadMore,
  notifications,
  readNotifications,
  unreadCount,
  unreadNotifications,
} = useNotificationsController();

const hasNotifications = computed(() => notifications.value.length > 0);
</script>
