<template>
  <div class="table-button-wrapper" style="display: flex; flex-wrap: nowrap">
    <v-btn
      icon
      variant="text"
      size="small"
      density="compact"
      :class="{ 'format-active': showToolbar }"
      @click="toggleShowToolbar"
    >
      <HintTooltip>{{
        !showToolbar
          ? 'Показать панель инструментов таблицы'
          : 'Скрыть панель инструментов таблицы'
      }}</HintTooltip>
      <component :is="ICONS.tableIcon" />
    </v-btn>
  </div>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';

// utils
import { ICONS } from '@/utils/icons';
import HintTooltip from './HintTooltip.vue';

const emits = defineEmits<{
  showToolbar: [boolean];
}>();

const showToolbar = ref<boolean>(false);

const toggleShowToolbar = () => {
  showToolbar.value = !showToolbar.value;
  emits('showToolbar', showToolbar.value);
};
</script>
