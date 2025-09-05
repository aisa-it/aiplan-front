<template>
  <q-btn
    flat
    dense
    @click="() => emits('update:modelValue', !modelValue)"
    class="btn-only-icon-sm"
  >
    <ArrowUp class="arrow-up" :class="{ 'rotate-180': modelValue }" />
  </q-btn>
</template>

<script lang="ts" setup>
import ArrowUp from '../icons/ArrowUp.vue';

withDefaults(
  defineProps<{
    modelValue: boolean;
  }>(),
  {
    modelValue: false,
  },
);

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>
