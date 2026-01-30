<template>
  <div class="notifications__list">
    <div class="row justify-around">
      <SettingsTabs
        :current-tab="currentTab"
        :list-tabs="listTabs"
        @set="(val: number) => (currentTab = val)"
        class="col-auto notifications__tabs"
        content-class="notifications__tabs-content"
      />
    </div>
    <template v-if="groupedNotifications.length">
      <div
        v-for="([date, notifications], index) in groupedNotifications"
        :key="date"
        class="row q-gutter-y-md"
      >
        <div
          class="flex col-12 justify-between items-center text-center q-mt-md"
        >
          <span class="notifications__tabs-date col-12 body-2">{{ date }}</span>
          <q-btn
            v-if="index === 0 && currentTab === 0"
            class="btn q-ml-md]"
            no-caps
            dense
            @click="onRead"
          >
            Прочитать все
          </q-btn>
        </div>
        <WorkspaceNotificationsBlock
          v-for="(item, id) in notifications"
          :key="item.id || id"
          :notification-row="item"
          :is-showed="item.viewed"
          @getNotifications="handleGetNotifications"
          class="col-12"
        />
      </div>
    </template>
    <div v-else class="notifications__no-data">
      <span class="body-1">Уведомления не найдены</span>
    </div>
    <div ref="lazyLoadTrigger" />
  </div>
</template>

<script setup lang="ts">
//core
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
// interfaces
import { NotificationsNotificationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
// components
import WorkspaceNotificationsBlock from './WorkspaceNotificationsBlock.vue';
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import { renderLongDateFormat } from 'src/utils/time';
import { useIntersectionObserver } from 'src/composables/useIntersectionObserver';

const props = defineProps<{
  readNotifications: NotificationsNotificationResponse[];
  unreadNotifications: NotificationsNotificationResponse[];
}>();

const emits = defineEmits<{ getNotifications: []; read: []; load: [] }>();

const { observer } = useIntersectionObserver(() => emits('load'));

//constants
const listTabs = [
  {
    name: 0,
    label: 'Непрочитанные',
  },
  {
    name: 1,
    label: 'Прочитанные',
  },
];

//state
const currentTab = ref(0);

const lazyLoadTrigger = ref<HTMLDivElement | null>(null);

//computed
const groupedNotifications = computed(() => {
  const list =
    currentTab.value === 0
      ? props.unreadNotifications
      : props.readNotifications;

  const groups: Record<string, NotificationsNotificationResponse[]> = {};

  list.forEach((item) => {
    if (!item.created_at) return;

    const dateKey = renderLongDateFormat(item.created_at);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
  });

  // Сортировка по дате убыванию (сначала новые)
  const sortedGroups = Object.entries(groups).sort(([dateA], [dateB]) => {
    const parsedA = new Date(dateA);
    const parsedB = new Date(dateB);
    return parsedB.getTime() - parsedA.getTime();
  });

  return sortedGroups;
});

//methods
const handleGetNotifications = () => {
  if (currentTab.value === 1) return;
  if (currentTab.value === 0) emits('getNotifications');
};

const onRead = () => {
  emits('read');
};

onMounted(() => {
  if (lazyLoadTrigger.value) observer.observe(lazyLoadTrigger.value);
});

onUnmounted(() => {
  observer.disconnect();
});
</script>
<style scoped lang="scss">
.notifications__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 75vh;
  overflow-y: auto;
  padding: 8px 24px;
  width: 100%;
  @media (max-width: 768px) {
    max-height: 35vh;
  }
}
.notifications__no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 6rem 0;
  padding: 0;
  color: $sub-text-color;
  height: fit-content;
  width: 100%;
}

.notifications__tabs {
  margin: 0px;
  width: 100%;
  justify-content: space-around;
}
.notifications__tabs-date {
  color: $sub-text-color;
}

::v-deep(.notifications__tabs-content) {
  width: 100%;
  padding-top: 0px;
}
</style>
