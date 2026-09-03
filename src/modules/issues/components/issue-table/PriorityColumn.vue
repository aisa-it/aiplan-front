<template>
  <div @click.stop>
    <v-select
      :model-value="issue.priority"
      :items="PRIORITY_OPTIONS"
      :disabled="!canEdit || isSaving"
      :loading="isSaving"
      :clearable="!!issue.priority"
      item-title="title"
      item-value="value"
      placeholder="Не Выбран"
      no-data-text="Нет приоритетов"
      density="compact"
      hide-details
      class="issue-priority-select w-40 max-w-full"
      @update:model-value="save"
    >
      <template #selection="{ item }">
        <PrioritySingleIcon :type="item.value" class="mr-1 shrink-0" />
        <span class="truncate">{{ item.title }}</span>
      </template>
      <template #item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps" density="compact">
          <template #prepend>
            <PrioritySingleIcon :type="item.value" class="mr-2" />
          </template>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import PrioritySingleIcon from '@/components/icons/PrioritySingleIcon.vue';
import { useIssueFieldEditor } from '../../composables/useIssueFieldEditor';

const props = defineProps<{ issue: DtoIssueWithCount }>();
const { canEdit, isSaving, save } = useIssueFieldEditor(
  () => props.issue,
  'priority',
);

const PRIORITY_OPTIONS = [
  { value: 'low', title: 'Низкий' },
  { value: 'medium', title: 'Средний' },
  { value: 'high', title: 'Высокий' },
  { value: 'urgent', title: 'Критический' },
];
</script>

<style scoped>
.issue-priority-select :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 14px;
}
.issue-priority-select :deep(.v-field__append-inner),
.issue-priority-select :deep(.v-field__clearable) {
  padding-top: 4px;
}
</style>
