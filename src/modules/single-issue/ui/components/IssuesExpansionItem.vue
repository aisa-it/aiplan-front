<template>
  <q-expansion-item
    v-model="expanded"
    expand-icon-toggle
    hide-expand-icon
    class="full-w q-px-sm issues-expansion-item-wrapper"
    header-class="no-padding-header"
  >
    <template v-slot:header><slot name="header"></slot></template>
    <slot></slot>
  </q-expansion-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const expanded = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emits('update:modelValue', val),
});

const emits = defineEmits(['refresh', 'update:modelValue']);
</script>

<style lang="scss" scoped>
:deep(.q-expansion-item__container > .no-padding-header) {
  padding: 0;
}
.issues-expansion-item-wrapper {
  padding: 8px 8px 0px 8px;
}
</style>
