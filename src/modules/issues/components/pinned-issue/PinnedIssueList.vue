<template>
  <div
    class="pinned-issue-list h-full min-h-0 overflow-y-auto p-4"
    @scroll="onScroll"
  >
    <div
      v-if="isLoading"
      class="pinned-issue-grid"
      role="status"
      aria-busy="true"
    >
      <div
        v-for="index in 10"
        :key="index"
        class="h-[148px] animate-pulse rounded-2xl bg-[rgba(var(--v-theme-on-background),0.08)] motion-reduce:animate-none"
      />
    </div>

    <div
      v-else-if="!items.length"
      class="flex h-full flex-col items-center justify-center gap-2"
    >
      <DocumentIcon :width="56" :height="56" />
      <h2 class="text-xl font-normal">{{ t('issues.pinned.empty') }}</h2>
    </div>

    <div v-else class="pinned-issue-grid">
      <PinnedIssueCard v-for="issue in items" :key="issue.id" :issue="issue" />
    </div>

    <div v-if="isLoadingMore" class="flex justify-center py-4" role="status">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DocumentIcon from '@/components/icons/DocumentIcon.vue';
import type { ProjectIssueListScope } from '../../model/issue-list.types';
import { usePinnedIssues } from '../../composables/usePinnedIssues';
import PinnedIssueCard from './PinnedIssueCard.vue';

const props = defineProps<{ scope: ProjectIssueListScope }>();
const { t } = useI18n();
const { items, isLoading, isLoadingMore, loadNext } = usePinnedIssues(
  props.scope,
);

const onScroll = (event: Event) => {
  if (isLoadingMore.value) return;

  const target = event.target as HTMLElement;
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
    void loadNext();
  }
};
</script>

<style scoped>
.pinned-issue-list {
  scrollbar-width: none;
}

.pinned-issue-list::-webkit-scrollbar {
  display: none;
}

.pinned-issue-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 8px;
}

@media (max-width: 767px) {
  .pinned-issue-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
