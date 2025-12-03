<template>
  <q-list class="flex column no-wrap" style="gap: 8px">
    <q-item
      v-for="issue in issues"
      :key="issue.id"
      clickable
      class="base-card"
      style="
        padding: 12px 16px;
        width: 100%;
        display: flex;
        gap: 12px;
        align-items: center;
      "
    >
      <q-checkbox
        :model-value="!!issue.id"
        @update:model-value="() => emit('delete', issue.id ?? '')"
        class="sprint-issue-checkbox"
      />

      <span
        class="identifier"
        :title="issue?.project_detail?.identifier + '-' + issue?.sequence_id"
      >
        {{ issue?.project_detail?.identifier }}-{{ issue?.sequence_id }}
      </span>

      <span class="name" :title="issue.name">{{ issue.name }}</span>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  issues: DtoIssue[];
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
}>();
</script>

<style lang="scss" scoped>
.q-item {
  min-width: 0;
}

.identifier {
  flex-shrink: 0;
  min-width: min-content;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
