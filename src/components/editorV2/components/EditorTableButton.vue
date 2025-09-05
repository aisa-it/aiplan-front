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

<script lang="ts">
// core
import { defineComponent, ref } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

export default defineComponent({
  name: 'EditorTableButton',
  emits: ['showToolbar'],
  setup(props, { emit }) {
    const showToolbar = ref<boolean>(false);

    const toggleShowToolbar = () => {
      showToolbar.value = !showToolbar.value;
      emit('showToolbar', showToolbar.value);
    };

    return {
      ICONS,
      showToolbar,
      toggleShowToolbar,
    };
  },
});
</script>
