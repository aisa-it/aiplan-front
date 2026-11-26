<template>
  <section class="issue-board-column flex min-h-0 flex-col gap-2" :style="accentStyle">
    <div class="issue-board-panel shrink-0 rounded-2xl border border-border">
      <component
        :is="group.total > 0 ? 'button' : 'div'"
        :type="group.total > 0 ? 'button' : undefined"
        :aria-expanded="group.total > 0 ? group.expanded : undefined"
        class="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-start"
        :class="{ 'cursor-pointer': group.total > 0 }"
        @click="group.total > 0 && emit('toggle')"
      >
        <IssueGroupHeading :group="group" />
        <v-icon
          v-if="group.total > 0"
          :icon="group.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          size="20"
        />
      </component>
      <PaginationDefault
        v-if="group.expanded && group.total > rowsPerPage"
        :selected-page="group.page"
        :rows-number="group.total"
        :rows-per-page="rowsPerPage"
        :max-pages="3"
        :show-rows-per-page="false"
        class="issue-board-pagination mx-4 mb-2"
        @update:selected-page="emit('page', $event)"
      />
    </div>

    <v-expand-transition>
      <div
        v-if="group.expanded && group.total > 0"
        ref="cardsViewport"
        class="issue-board-cards relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
        :aria-busy="group.loading"
        @scroll.passive="onScroll"
      >
        <v-progress-linear
          v-if="group.loading"
          indeterminate
          color="primary"
          class="sticky top-0 z-10"
        />
        <div class="flex flex-col gap-2">
          <IssueBoardCard
            v-for="issue in group.items"
            :key="issue.id"
            :issue="issue"
            :property-templates="propertyTemplates"
            @manage-sprints="emit('manage-sprints', issue)"
          />
        </div>
      </div>
    </v-expand-transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  DtoIssueWithCount,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import PaginationDefault from '@/components/pagination/PaginationDefault.vue';
import IssueGroupHeading from '../grouped/IssueGroupHeading.vue';
import type { IssueGroup, IssueGroupHeader } from '../../model/issue-groups';
import IssueBoardCard from './IssueBoardCard.vue';

const props = defineProps<{
  group: IssueGroup & IssueGroupHeader;
  rowsPerPage: number;
  accent?: string;
  initialScrollTop?: number;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();
const emit = defineEmits<{
  toggle: [];
  page: [page: number];
  'scroll-position': [scrollTop: number];
  'manage-sprints': [issue: DtoIssueWithCount];
}>();

const accentStyle = computed(() =>
  props.accent
    ? { '--issue-board-accent': props.accent, '--issue-board-accent-width': '4px' }
    : undefined,
);
const cardsViewport = ref<HTMLElement | null>(null);

watch(
  cardsViewport,
  (element) => {
    if (element) element.scrollTop = props.initialScrollTop ?? 0;
  },
  { flush: 'post' },
);
watch(() => props.group.page, () => {
  if (cardsViewport.value) cardsViewport.value.scrollTop = 0;
  emit('scroll-position', 0);
});

function onScroll(event: Event) {
  emit('scroll-position', (event.currentTarget as HTMLElement).scrollTop);
}
</script>

<style scoped>
.issue-board-cards {
  scrollbar-width: none;
}

.issue-board-cards::-webkit-scrollbar {
  display: none;
}

.issue-board-panel {
  border-inline-start-color: var(--issue-board-accent, rgb(var(--v-theme-border)));
  border-inline-start-width: var(--issue-board-accent-width, 1px);
}

.issue-board-pagination :deep(.v-pagination__list) {
  justify-content: center;
}

.issue-board-pagination :deep(.v-pagination) {
  width: 100%;
}
</style>
