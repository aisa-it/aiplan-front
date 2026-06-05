<template>
  <q-btn
    class="no-hover"
    dense
    flat
    :disable="canChangeFontSize"
    @click="changeFontSize"
  >
    <HintTooltip>{{ tooltip }}</HintTooltip>
    <component :is="ICONS[iconName]" />
  </q-btn>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

const props = defineProps<{
  editorInstance: Editor;
  command: 'increment' | 'decrement';
  tooltip: string;
  iconName: string;
  isMobile?: boolean;
}>();

// function
const changeFontSize = () => {
  const currentFontSize =
    props.editorInstance.getAttributes('textStyle').fontSize;
  const newFontSize = calculateNewFontSize(currentFontSize);
  if (props.isMobile) {
    props.editorInstance.chain().setFontSize(newFontSize).run();
  } else {
    props.editorInstance.chain().focus().setFontSize(newFontSize).run();
  }
};

const calculateNewFontSize = (currentFontSize: string | null) => {
  const currentSeize = currentFontSize ?? '14px';

  const currentSize = parseInt(currentSeize.replace('px', ''));
  const increment = props.command === 'increment';

  if (increment) {
    return `${currentSize + 2}px`;
  } else {
    return `${currentSize - 2}px`;
  }
};

// computed
const canChangeFontSize = computed(() => {
  return props.editorInstance.isActive('codeBlock');
});
</script>

<style lang="scss" scoped>
@media screen and (max-width: 760px) {
  .no-hover:hover,
  .no-hover:focus,
  .no-hover:active {
    background-color: transparent !important;
    box-shadow: none !important;
    color: inherit !important;
  }
}
</style>
