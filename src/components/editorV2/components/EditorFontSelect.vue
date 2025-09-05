<template>
  <q-select
    v-model="fontValue"
    ref="fontMenu"
    class="html-editor__select"
    :options="listFont"
    hide-dropdown-icon
    options-dense
    :popup-content-class="`html-editor__select-option scrollable-content ${classPrevent}`"
    @update:model-value="updateFont($event)"
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
// core
import { Editor } from '@tiptap/vue-3';
import { ref, shallowRef, watch } from 'vue';
// utils
import { ListFont } from 'src/components/editorV2/utils/tiptap';
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

const listFont = ListFont;
const defaultFontValue = listFont[0];
const fontValue = shallowRef(ListFont[0]);
const isOpenSelect = ref(false);
const fontMenu = ref<QSelect>();

if (!props.isMobile) useMenuHandler(fontMenu);
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
