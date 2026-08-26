<template>
  <main class="h-full">
    <header class="flex justify-between min-w-0 items-center px-4 py-3">
      <div
        class="min-w-0 max-w-[calc(100%_-_60px)] text-xl font-normal leading-8"
      >
        <v-skeleton-loader
          v-if="isLoading"
          type="text"
          width="300"
          class="max-w-full"
        />

        <span v-else class="block truncate">
          Задачи проекта {{ project?.name }}
        </span>
      </div>
      <DotListIcon />
    </header>

    <v-tabs
      v-model="currentTab"
      align-tabs="start"
      color="primary"
      :grow="isMobile"
      class="mb-2"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        color="primary"
      >
        <component
          :is="tab.icon"
          :class="{ 'rotate-90': tab.value === 'pinned' }"
        />
        <span
          class="text-base normal-case tracking-[0.5px] ml-2 hidden sm:inline"
          >{{ tab.label }}</span
        >
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="currentTab">
      <v-tabs-window-item
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="min-h-[80vh]"
      >
        <span>{{ tab.label }}</span>
      </v-tabs-window-item>
    </v-tabs-window>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMediaQuery } from '@vueuse/core';

import { useProjectStore } from '@/stores/project-store';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon.vue';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import PinIcon from '@/components/icons/PinIcon.vue';

type ProjectTab = 'general' | 'pinned' | 'analytics';

const tabs: Array<{
  value: ProjectTab;
  label: string;
  icon: typeof DotListIcon;
}> = [
  {
    value: 'general',
    label: 'Основные',
    icon: DotListIcon,
  },
  {
    value: 'pinned',
    label: 'Закрепленные задачи',
    icon: PinIcon,
  },
  {
    value: 'analytics',
    label: 'Аналитика',
    icon: AnalyticsIcon,
  },
];

const currentTab = ref<ProjectTab>('general');
const isMobile = useMediaQuery('(max-width: 639px)');
const { project, isLoading } = storeToRefs(useProjectStore());
</script>
