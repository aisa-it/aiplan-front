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
          {{ t('common.screens.project.tasksTitle', { name: project?.name }) }}
        </span>
      </div>
      <DotListIcon />
    </header>

    <v-tabs
      v-model="currentTab"
      align-tabs="start"
      color="primary"
      :grow="mobile"
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
          >{{ t(tab.labelKey) }}</span
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
        <span>{{ t(tab.labelKey) }}</span>
      </v-tabs-window-item>
    </v-tabs-window>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useProjectStore } from '@/stores/project-store';
import type { MessageKey } from '@/i18n';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon.vue';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import PinIcon from '@/components/icons/PinIcon.vue';
import { useDisplay } from 'vuetify';

type ProjectTab = 'general' | 'pinned' | 'analytics';

// Extract привязывает литералы к существующим ключам словаря: опечатка или удаление ключа падает на vue-tsc
type TabLabelKey = Extract<
  MessageKey,
  | 'common.screens.project.tabs.general'
  | 'common.screens.project.tabs.pinned'
  | 'common.screens.project.tabs.analytics'
>;

const tabs: Array<{
  value: ProjectTab;
  labelKey: TabLabelKey;
  icon: typeof DotListIcon;
}> = [
  {
    value: 'general',
    labelKey: 'common.screens.project.tabs.general',
    icon: DotListIcon,
  },
  {
    value: 'pinned',
    labelKey: 'common.screens.project.tabs.pinned',
    icon: PinIcon,
  },
  {
    value: 'analytics',
    labelKey: 'common.screens.project.tabs.analytics',
    icon: AnalyticsIcon,
  },
];

const { t } = useI18n();

const currentTab = ref<ProjectTab>('general');
const { mobile } = useDisplay();
const { project, isLoading } = storeToRefs(useProjectStore());
</script>
