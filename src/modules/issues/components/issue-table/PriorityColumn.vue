<template>
  <div @click.stop>
    <v-menu v-model="isOpen" :close-on-content-click="false">
      <template #activator="{ props: activatorProps }">
        <div class="relative w-40 max-w-full">
          <button
            v-bind="activatorProps"
            type="button"
            :disabled="!canEdit || isSaving"
            class="flex min-h-8 w-full items-center gap-1 border-b border-border text-left enabled:cursor-pointer enabled:hover:border-primary disabled:border-transparent"
            :class="{
              'pr-10': issue.priority && canEdit,
              'pr-5': !issue.priority && canEdit,
            }"
          >
            <PrioritySingleIcon
              v-if="issue.priority"
              :type="issue.priority"
              class="shrink-0"
            />
            <span class="min-w-0 flex-1 truncate">{{ priorityTitle }}</span>
            <v-progress-circular
              v-if="isSaving"
              indeterminate
              size="16"
              width="2"
              class="absolute right-0"
            />
            <v-icon
              v-else-if="canEdit"
              icon="mdi-menu-down"
              size="18"
              class="absolute right-0"
            />
          </button>

          <button
            v-if="issue.priority && canEdit && !isSaving"
            type="button"
            aria-label="Убрать приоритет"
            class="absolute top-1/2 right-5 z-10 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center opacity-60 transition-opacity hover:opacity-100 focus:opacity-100"
            @pointerdown.stop
            @click.stop.prevent="clearPriority"
          >
            <v-icon icon="mdi-close-circle" size="16" />
          </button>
        </div>
      </template>

      <v-list v-if="isOpen" min-width="200" density="compact">
        <v-list-item
          v-for="option in PRIORITY_OPTIONS"
          :key="option.value"
          :disabled="isSaving"
          @click="selectPriority(option.value)"
        >
          <template #prepend>
            <div class="mr-2 flex size-5 shrink-0 items-center justify-center">
              <PrioritySingleIcon v-if="option.value" :type="option.value" />
            </div>
          </template>
          <v-list-item-title>{{ option.title }}</v-list-item-title>
          <template #append>
            <v-icon
              v-if="option.value === issue.priority"
              icon="mdi-check"
              size="18"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import PrioritySingleIcon from '@/components/icons/PrioritySingleIcon.vue';

import { useIssueFieldEditor } from '../../composables/useIssueFieldEditor';

const props = defineProps<{ issue: DtoIssueWithCount }>();
const isOpen = ref(false);
const { canEdit, isSaving, save } = useIssueFieldEditor(
  () => props.issue,
  'priority',
);

const PRIORITY_OPTIONS = [
  { value: 'low', title: 'Низкий' },
  { value: 'medium', title: 'Средний' },
  { value: 'high', title: 'Высокий' },
  { value: 'urgent', title: 'Критический' },
] as const;

const priorityTitle = computed(
  () =>
    PRIORITY_OPTIONS.find((option) => option.value === props.issue.priority)
      ?.title ?? 'Не Выбран',
);

const selectPriority = async (
  value: (typeof PRIORITY_OPTIONS)[number]['value'],
) => {
  if (value === props.issue.priority || (await save(value))) {
    isOpen.value = false;
  }
};

const clearPriority = async () => {
  await save(null);
};
</script>
