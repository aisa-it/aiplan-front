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
    <span
      v-if="issue.parent && issue.parent_detail?.sequence_id && !hideParent"
      class="inline-flex min-h-8 shrink-0 items-center rounded-2xl border border-border px-1.5 py-px text-primary"
      :title="`Родитель: ${issue.project_detail?.identifier} - ${issue.parent_detail.sequence_id}`"
    >
      <ConnectIcon :width="16" :height="16" class="mx-0.5" />
      {{ issue.parent_detail.sequence_id }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import ConnectIcon from '@/components/icons/ConnectIcon.vue';

defineProps<{
  issue: DtoIssueWithCount;
  hideParent?: boolean;
}>();
</script>
