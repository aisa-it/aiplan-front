<template>
  <div
    class="flex h-[calc(100dvh-var(--v-layout-top))] min-h-0 flex-col overflow-hidden"
  >
    <div class="flex justify-between min-w-0 items-center px-4 py-3">
      <div
        class="min-w-0 max-w-[calc(100%-60px)] text-xl font-normal leading-8"
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
    </div>

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

    <v-tabs-window
      v-model="currentTab"
      class="project-tabs-window min-h-0 flex-1"
    >
      <v-tabs-window-item
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="h-full min-h-0"
      >
        <ProjectIssueList
          v-if="tab.value === 'general' && issueListScope && !isLoading"
          :key="issueListScope.projectId"
          :scope="issueListScope"
          :view-settings="meInProject?.view_props"
          :hide-parent="project?.hide_fields?.includes('sub_issues_count')"
        />
        <IssueTableSkeleton v-else-if="tab.value === 'general' && isLoading" />
        <span v-else-if="tab.value !== 'general'">{{ t(tab.labelKey) }}</span>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useProjectStore } from '@/stores/project-store';
import type { MessageKey } from '@/i18n';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon.vue';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import PinIcon from '@/components/icons/PinIcon.vue';

import {
  ProjectIssueList,
  IssueTableSkeleton,
  type ProjectIssueListScope,
} from '@/modules/issues';

const props = defineProps<{
  workspaceSlug: string;
  projectId: string;
}>();

import { useDisplay } from 'vuetify';

type ProjectTab = 'general' | 'pinned' | 'analytics';

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
const { project, meInProject, isLoading } = storeToRefs(useProjectStore());

const issueListScope = computed<ProjectIssueListScope | undefined>(() => {
  const workspaceSlug = props.workspaceSlug;

  if (!props.workspaceSlug || !project.value?.id) {
    return undefined;
  }

  return {
    type: 'project',
    workspaceSlug,
    projectId: project.value.id,
  };
});
</script>

<style scoped>
.project-tabs-window :deep(.v-window__container),
.project-tabs-window :deep(.v-window-item) {
  height: 100%;
  min-height: 0;
}
</style>
