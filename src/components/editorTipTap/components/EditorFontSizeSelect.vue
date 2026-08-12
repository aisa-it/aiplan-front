<template>
  <v-select
    v-model="sizeValue"
    class="html-editor__select"
    :items="listSize"
    variant="plain"
    density="compact"
    hide-details
    menu-icon=""
    :menu-props="{
      contentClass: `html-editor__select-option scrollable-content ${classPrevent}`,
    }"
    :disabled="canChangeFontSize"
    @update:model-value="updateSize($event)"
    @update:menu="isOpenSelect = $event"
  >
    <HintTooltip>Шрифт</HintTooltip>

    <template #append-inner>
      <v-icon
        icon="mdi-chevron-down"
        class="chevron-rotate"
        :class="{ 'rotate-180': isOpenSelect }"
      />
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import type { Editor as CoreEditor } from '@tiptap/core';
import { computed, ref, shallowRef, watch } from 'vue';
// components
import HintTooltip from './HintTooltip.vue';
// utils
import { ListSize } from '../utils/tiptap';
// import { useMenuHandler } from 'src/composables/useMenuHandler'; // TODO: useMenuHandler

const props = defineProps<{
  editorInstance: Editor;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}>();

//vars
const listSize = ListSize;
const defaultSizeValue = listSize[2];
const sizeValue = shallowRef(defaultSizeValue);
const isOpenSelect = ref(false);
// const fontSizeMenu = ref<any>(null);
// function
// if (!props.isMobile) useMenuHandler(fontSizeMenu); // TODO: useMenuHandler

const updateSize = (size: string) => {
  if (props.isMobile) {
    props.editorInstance.chain().setFontSize(size).run();
  } else {
    props.editorInstance.chain().focus().setFontSize(size).run();
  }
};

const updateSelectedSize = () => {
  if (props.editorInstance.isActive('heading')) return;
  const fontSizes = new Set<string>();

  props.editorInstance.state.doc.nodesBetween(
    props.editorInstance.state.selection.from,
    props.editorInstance.state.selection.to,
    (node) => {
      const fontSize = node.marks?.find(
        (mark) => mark.type.name === 'textStyle',
      )?.attrs?.fontSize;

      if (fontSize) {
        fontSizes.add(fontSize);
      }
    },
  );

  if (fontSizes.size) {
    sizeValue.value = fontSizes.size === 1 ? [...fontSizes][0] : '-';
  } else {
    sizeValue.value =
      props.editorInstance.getAttributes('textStyle').fontSize ||
      defaultSizeValue;
  }
};

const defaultFontSizeHandler = ({ editor }: { editor: CoreEditor }) => {
  if (props.editorInstance.isActive('heading')) return;
  const { empty } = editor.view.state.selection;

  const currentFontSize = editor.getAttributes('textStyle')?.fontSize;

  if (empty && !currentFontSize) {
    editor.chain().setFontSize(defaultSizeValue).run();
  }
};

// computed
const canChangeFontSize = computed(() => {
  return (
    props.editorInstance.isActive('codeBlock') ||
    props.editorInstance.isActive('heading')
  );
});

// hook
watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateSelectedSize);
      newEditor.on('transaction', updateSelectedSize);
      newEditor.on('selectionUpdate', defaultFontSizeHandler);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateSelectedSize);
      oldEditor.off('transaction', updateSelectedSize);
      oldEditor.off('selectionUpdate', defaultFontSizeHandler);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => props.isFormatSampleActive,
  (newValue) => {
    if (!newValue) {
      sizeValue.value =
        props.editorInstance.getAttributes('textStyle').fontSize ||
        defaultSizeValue;
    }
  },
  {
    immediate: true,
  },
);
</script>
