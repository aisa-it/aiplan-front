<template>
  <button
    v-if="editable"
    type="button"
    class="flex min-h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-1 border-b border-border text-start hover:border-primary"
    :title="sprintText"
    @click.stop="emit('edit')"
  >
    <span class="truncate">{{ sprintText }}</span>
    <v-icon icon="mdi-menu-down" size="16" />
  </button>
  <span v-else class="ml-1 block truncate" :title="sprintText">{{ sprintText }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ sprints?: DtoSprintLight[]; editable?: boolean }>();
const emit = defineEmits<{ edit: [] }>();
const { t } = useI18n();

const sprintText = computed(() =>
  props.sprints?.length
    ? props.sprints.map((sprint) => sprint.name).join(', ')
    : t('issues.notSelected'),
);
</script>
