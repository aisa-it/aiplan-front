<template>
  <div @click.stop>
    <v-menu v-model="isOpen" :close-on-content-click="false">
      <template #activator="{ props: activatorProps }">
        <button
          v-bind="activatorProps"
          type="button"
          :disabled="!canEdit || isSaving"
          class="flex min-h-8 items-center gap-1.5 rounded-lg whitespace-nowrap enabled:cursor-pointer enabled:hover:text-primary"
        >
          <CalendarIcon class="shrink-0" />
          <span>{{
            issue.target_date
              ? formatDateTime(issue.target_date)
              : 'Не установлен'
          }}</span>
          <v-progress-circular
            v-if="isSaving"
            indeterminate
            size="16"
            width="2"
          />
        </button>
      </template>
      <TargetDatePicker
        v-if="isOpen"
        :initial-date="issue.target_date"
        :is-saving="isSaving"
        @save="saveDate"
      />
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import { formatDateTime } from '@/utils/time';
import { defineAsyncComponent, ref } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueFieldEditor } from '../../composables/useIssueFieldEditor';
const TargetDatePicker = defineAsyncComponent(
  () => import('./TargetDatePicker.vue'),
);

const props = defineProps<{ issue: DtoIssueWithCount }>();
const isOpen = ref(false);
const { canEdit, isSaving, save } = useIssueFieldEditor(
  () => props.issue,
  'target_date',
);

const saveDate = async (value: string | null) => {
  if (await save(value)) isOpen.value = false;
};
</script>
