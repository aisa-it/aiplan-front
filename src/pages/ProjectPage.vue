<template>
  <main
    class="flex h-[calc(100dvh_-_var(--v-layout-top))] min-h-0 flex-col overflow-hidden"
  >
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
        <span v-else-if="tab.value !== 'general'">{{ tab.label }}</span>
      </v-tabs-window-item>
    </v-tabs-window>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useMediaQuery } from '@vueuse/core';

import { useProjectStore } from '@/stores/project-store';
import AnalyticsIcon from '@/components/icons/AnalyticsIcon.vue';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import PinIcon from '@/components/icons/PinIcon.vue';
import { ProjectIssueList, IssueTableSkeleton, type ProjectIssueListScope } from '@/modules/issues';

const props = defineProps<{
  workspaceSlug?: string;
  projectId?: string;
}>();

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
const { project, meInProject, isLoading } = storeToRefs(useProjectStore());

const issueListScope = computed<ProjectIssueListScope | undefined>(() => {
  const workspaceSlug = props.workspaceSlug || project.value?.workspace_detail?.slug;

  if (!workspaceSlug || !project.value?.id || !project.value.identifier) {
    return undefined;
  }

  return {
    type: 'project',
    workspaceSlug,
    projectId: project.value.id,
    projectIdentifier: project.value.identifier,
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
