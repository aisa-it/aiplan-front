<template>
  <div class="flex no-wrap table-button-wrapper">
    <q-btn
      dense
      flat
      :class="{ 'format-active': showToolbar }"
      @click="toggleShowToolbar"
    >
      <HintTooltip>{{
        !showToolbar
          ? 'Показать панель инструментов таблицы'
          : 'Скрыть панель инструментов таблицы'
      }}</HintTooltip>
      <component :is="ICONS.tableIcon" />
    </q-btn>
  </div>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

const emits = defineEmits<{
  showToolbar: [boolean];
}>();

const showToolbar = ref<boolean>(false);

const toggleShowToolbar = () => {
  showToolbar.value = !showToolbar.value;
  emits('showToolbar', showToolbar.value);
};
</script>
