<template>
  <q-list class="flex column no-wrap" style="">
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
      />

      <span> {{ issue?.project_detail?.name }}-{{ issue?.sequence_id }}</span>

      <span>{{ issue.name }}</span>
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
