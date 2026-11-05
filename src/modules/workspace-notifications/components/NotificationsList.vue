<template>
  <div class="flex h-full min-h-0 flex-col px-6 pb-2">
    <v-tabs v-model="activeTab" color="primary" grow height="40">
      <v-tab class="normal-case" value="unread">Непрочитанные</v-tab>
      <v-tab class="normal-case" value="read">Прочитанные</v-tab>
    </v-tabs>

    <v-virtual-scroll
      v-if="rows.length"
      ref="virtualScroll"
      :items="rows"
      item-key="key"
      class="min-h-0 max-h-[calc(75vh-112px)] overflow-y-auto flex-1"
      @scroll.passive="onScroll"
    >
      <template #default="{ item, index }">
        <div
          v-if="item.type === 'date'"
          class="relative flex min-h-12 items-center justify-between py-3 text-sm text-secondary"
        >
          <span>{{ item.label }}</span>

          <v-btn
            v-if="index === 0 && activeTab === 'unread'"
            class="normal-case"
            density="compact"
            variant="text"
            color="text"
            :loading="isMarkingAllAsRead"
            :disabled="isMarkingAsRead"
            @click="emit('readAll')"
          >
            Прочитать все
          </v-btn>
        </div>

        <NotificationItem
          v-else
          :is-marking-as-read="isMarkingAsRead"
          :notification="item.notification"
          @read="emit('read', $event)"
        />
      </template>
    </v-virtual-scroll>

    <div v-else class="grid min-h-65 flex-1 place-items-center text-secondary">
      Уведомления не найдены
    </div>

    <div v-if="isLoadingMore" class="flex h-8 shrink-0 justify-center pt-1">
      <DefaultLoader :size="20" :width="2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import DefaultLoader from '@/components/loaders/DefaultLoader.vue';
import NotificationItem from './NotificationItem.vue';
import type {
  NotificationListRow,
  NotificationTab,
  WorkspaceNotification,
} from '../models';

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

interface NotificationDateGroup {
  date: Date;
  key: string;
  notifications: WorkspaceNotification[];
}

interface VirtualScrollInstance {
  scrollToIndex: (index: number) => void;
}

const props = defineProps<{
  hasMoreRead: boolean;
  hasMoreUnread: boolean;
  isLoadingMore: boolean;
  isMarkingAllAsRead: boolean;
  isMarkingAsRead: boolean;
  readNotifications: WorkspaceNotification[];
  unreadNotifications: WorkspaceNotification[];
}>();

const emit = defineEmits<{
  loadMore: [type: NotificationTab];
  read: [id: string];
  readAll: [];
}>();

const activeTab = defineModel<NotificationTab>('activeTab', {
  required: true,
});

const virtualScroll = ref<VirtualScrollInstance>();

const selectedNotifications = computed(() =>
  activeTab.value === 'unread'
    ? props.unreadNotifications
    : props.readNotifications,
);

const rows = computed<NotificationListRow[]>(() => {
  const groups = new Map<string, NotificationDateGroup>();

  selectedNotifications.value.forEach((notification) => {
    if (!notification.created_at) return;

    const date = new Date(notification.created_at);
    if (Number.isNaN(date.getTime())) return;

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    const group = groups.get(key);

    if (group) {
      group.notifications.push(notification);
      return;
    }

    groups.set(key, {
      date,
      key,
      notifications: [notification],
    });
  });

  return [...groups.values()]
    .sort((first, second) => second.date.getTime() - first.date.getTime())
    .flatMap<NotificationListRow>((group) => [
      {
        date: group.key,
        key: `date:${group.key}`,
        label: `${group.date.getDate()} ${MONTH_NAMES[group.date.getMonth()]} ${group.date.getFullYear()}`,
        type: 'date',
      },
      ...group.notifications.map(
        (notification): NotificationListRow => ({
          key: `notification:${notification.id}`,
          notification,
          type: 'notification',
        }),
      ),
    ]);
});

const onScroll = (event: Event) => {
  if (props.isLoadingMore) return;

  const element = event.target as HTMLElement;
  const isNearBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight < 50;
  const hasMore =
    activeTab.value === 'unread' ? props.hasMoreUnread : props.hasMoreRead;

  if (isNearBottom && hasMore) {
    emit('loadMore', activeTab.value);
  }
};

watch(activeTab, async () => {
  await nextTick();
  virtualScroll.value?.scrollToIndex(0);
});
</script>
