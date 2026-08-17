<template>
  <v-select
    v-model="fontValue"
    class="html-editor__select"
    :items="listFont"
    variant="underlined"
    density="compact"
    hide-details
    color="primary"
    :menu-props="{
      contentClass: `html-editor__select-option ${classPrevent}`,
      maxHeight: 225,
    }"
    @update:model-value="updateFont($event)"
  >
    <HintTooltip>Шрифт</HintTooltip>
  </v-select>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { shallowRef, watch } from 'vue';
// components
import HintTooltip from './HintTooltip.vue';
// utils
import { ListFont } from '../utils/tiptap';
// import { useMenuHandler } from 'src/composables/useMenuHandler'; // TODO: useMenuHandler

const props = defineProps<{
  editorInstance: Editor;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}>();

const listFont = ListFont;
const defaultFontValue = listFont[0];
const fontValue = shallowRef(ListFont[0]);
const updateFont = (font: string) => {
  if (props.isMobile) {
    props.editorInstance.chain().setFontFamily(font).run();
  } else {
    props.editorInstance.chain().focus().setFontFamily(font).run();
  }
};

const updateSelectedFont = () => {
  fontValue.value =
    props.editorInstance.getAttributes('textStyle').fontFamily ||
    defaultFontValue;
};

watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateSelectedFont);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateSelectedFont);
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
      fontValue.value =
        props.editorInstance.getAttributes('textStyle').fontFamily ||
        defaultFontValue;
    }
  },
  {
    immediate: true,
  },
);
</script>
