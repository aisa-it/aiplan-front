<template>
  <q-input
    :model-value="modelValue"
    class="base-input"
    label="Поиск"
    dense
    @update:model-value="handleSearchIssues"
  />
</template>

<script setup lang="ts">
import { debounce } from 'quasar';

defineProps<{ modelValue?: string }>();

const emits = defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

const handleSearchIssues = debounce(async (input: string | number | null) => {
  emits('update:modelValue', input);
}, 700);
</script>
