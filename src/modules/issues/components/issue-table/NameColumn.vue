<template>
  <div class="flex min-w-0 items-center gap-4">
    <div class="relative min-w-0 flex-1 px-1 py-2">
      <span class="block truncate" :title="issue.name">{{ issue.name }}</span>
      <span
        v-if="issue.draft"
        class="absolute -top-1.5 left-0.5 rounded bg-orange-500 px-1 py-0.5 text-xs leading-3 text-white"
      >
        Черновик
      </span>
    </div>

    <!-- TODO: открывать предпросмотр родителя после переноса панели задачи. -->
    <ParentIssueChip
      :issue="issue"
      :hide-parent="hideParent"
      compact
      class="shrink-0"
    />
  </div>
</template>

<script setup lang="ts">
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import ParentIssueChip from '../ParentIssueChip.vue';

defineProps<{
  issue: DtoIssueWithCount;
  hideParent?: boolean;
}>();
</script>
