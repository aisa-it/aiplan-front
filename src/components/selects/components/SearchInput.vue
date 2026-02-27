<template>
  <div class="select-search">
    <q-input
      style="padding: 8px"
      clearable
      dense
      autofocus
      label="Поиск"
      class="base-input"
      v-model="modelValue"
      @update:model-value="
        (newModelValue) => emits('update:modelValue', String(newModelValue))
      "
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

const emits = defineEmits<{
  'update:modelValue': [string];
}>();
</script>
