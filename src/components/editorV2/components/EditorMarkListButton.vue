<template>
  <q-btn
    dense
    flat
    @click="runCommand"
    @contextmenu.prevent
    :disable="!canRunCommand"
    :class="isActive ? 'format-active' : 'no-hover'"
  >
    <HintTooltip>{{ tooltip }}</HintTooltip>
    <component :is="ICONS[iconName]" color="currentColor" />
  </q-btn>
</template>

<script lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed, defineComponent, PropType } from 'vue';

// utils
import { ICONS } from 'src/utils/icons';

export default defineComponent({
  name: 'EditorFormatButton',
  props: {
    editorInstance: {
      type: Object as PropType<Editor>,
      required: true,
    },
    command: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      required: true,
    },
    iconName: {
      type: String,
      required: true,
    },
    formatName: {
      type: String,
      default: '',
    },
    isMobile: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isActive = computed(() => {
      return props.formatName
        ? props.editorInstance.isActive(props.formatName)
        : false;
    });

    const canRunCommand = computed(() => {
      return (
        props.editorInstance.can().chain().focus()[props.command]().run() ||
        isCursorInList(props.editorInstance)
      );
    });

    // function
    const runCommand = () => {
      if (props.isMobile) {
        props.editorInstance.chain()[props.command]().run();
      } else {
        props.editorInstance.chain().focus()[props.command]().run();
      }
    };

    const isCursorInList = (editor: Editor): boolean => {
      if (!editor) return false;

      const { $from } = editor.state.selection;

      // Проходим вверх по дереву от курсора и проверяем тип узла
      for (let depth = $from.depth; depth > 0; depth--) {
        const node = $from.node(depth);
        if (
          node.type.name === 'bulletList' ||
          node.type.name === 'orderedList'
        ) {
          return true;
        }
      }

      return false;
    };

    return {
      ICONS,
      isActive,
      runCommand,
      canRunCommand,
    };
  },
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
