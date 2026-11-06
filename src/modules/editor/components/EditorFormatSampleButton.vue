<template>
  <EditorToolbarButton
    :active="active"
    icon="format"
    tooltip="Форматирование по образцу"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
import EditorToolbarButton from './EditorToolbarButton.vue';

defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>
