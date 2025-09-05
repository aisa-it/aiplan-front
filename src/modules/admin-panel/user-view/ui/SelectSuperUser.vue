<template>
  <q-select
    :model-value="value"
    dense
    class="base-selector-sm"
    :options="ADMIN_OPTIONS"
    option-value="value"
    option-label="label"
    map-options
    @update:model-value="$emit('change', $event.value)"
  />
</template>

<script setup lang="ts">
const ADMIN_OPTIONS = [
  { label: 'Да', value: true },
  { label: 'Нет', value: false },
];

defineProps<{ value: boolean }>();
defineEmits<{ change: [newVal: boolean] }>();
</script>
