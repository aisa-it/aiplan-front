<template>
  <q-select
    v-model="sizeValue"
    ref="fontSizeMenu"
    class="html-editor__select"
    :options="listSize"
    hide-dropdown-icon
    options-dense
    :popup-content-class="`html-editor__select-option scrollable-content ${classPrevent}`"
    :disable="canChangeFontSize"
    @update:model-value="updateSize($event)"
    @popup-show="isOpenSelect = true"
    @popup-hide="isOpenSelect = false"
  >
    <HintTooltip>Шрифт</HintTooltip>

    <template #append>
      <ArrowDown
        class="chevron-rotate"
        :class="{ 'rotate-180': isOpenSelect }"
      />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import type { Editor as CoreEditor } from '@tiptap/core';
import { computed, ref, shallowRef, watch } from 'vue';
// utils
import { ListSize } from 'src/components/editorV2/utils/tiptap';
// components
import ArrowDown from 'components/icons/ArrowDown.vue';
import { QSelect } from 'quasar';
import { useMenuHandler } from 'src/composables/useMenuHandler';

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
const fontSizeMenu = ref<QSelect>();
// function
if (!props.isMobile) useMenuHandler(fontSizeMenu);

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
