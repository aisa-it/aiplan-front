<template>
  <v-btn
    icon
    variant="text"
    size="small"
    density="compact"
    :disabled="!canRunCommand"
    :class="isActive ? 'format-active' : 'no-hover'"
    @click="runCommand"
    @contextmenu.prevent
  >
    <HintTooltip>{{ tooltip }}</HintTooltip>
    <component :is="ICONS[iconName]" color="currentColor" />
  </v-btn>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed } from 'vue';

// utils
import { ICONS } from '@/utils/icons';
import HintTooltip from './HintTooltip.vue';

const props = defineProps<{
  editorInstance: Editor;
  command: string;
  tooltip: string;
  iconName: string;
  formatName: string;
  isMobile?: boolean;
}>();
const isActive = computed(() => {
  return props.formatName
    ? props.editorInstance.isActive(props.formatName)
    : false;
});

const canRunCommand = computed(() => {
  return (
    !!props.editorInstance.can().chain().focus()[props.command]?.().run() ||
    isCursorInList(props.editorInstance)
  );
});

const runCommand = () => {
  if (props.isMobile) {
    props.editorInstance.chain()[props.command]?.().run();
  } else {
    props.editorInstance.chain().focus()[props.command]?.().run();
  }
};

const isCursorInList = (editor: Editor): boolean => {
  if (!editor) return false;

  const { $from } = editor.state.selection;

  // Проходим вверх по дереву от курсора и проверяем тип узла
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
      return true;
    }
  }

  return false;
};
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
