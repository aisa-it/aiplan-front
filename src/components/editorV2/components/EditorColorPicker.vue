<template>
  <q-btn-dropdown
    dense
    flat
    :disable="!isDisabled"
    :content-class="classPrevent"
  >
    <template #label>
      <HintTooltip>Цвет шрифта</HintTooltip>
      <span :style="{ color: colorValue }">
        <component :is="ICONS.fontColorIcon" />
      </span>
    </template>

    <ColorPicker
      :model-value="colorValue"
      @select-text-color="updateColor"
      :is-bg-color="false"
      :is-spoiler="false"
      :class-prevent="classPrevent"
    />
  </q-btn-dropdown>
</template>

<script setup lang="ts">
//core
import { shallowRef, watch, computed } from 'vue';
import { Editor } from '@tiptap/vue-3';
//icons
import { ICONS } from 'src/utils/icons';
//components
import ColorPicker from './ColorPicker.vue';

interface IEditorColorPickerProps {
  editorInstance: Editor;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}

const props = withDefaults(defineProps<IEditorColorPickerProps>(), {
  isFormatSampleActive: false,
  isMobile: false,
});

// state
const colorValue = shallowRef<string>();

// computed
const isDisabled = computed(() => {
  return props.editorInstance
    .can()
    .chain()
    .focus()
    .setHighlight(colorValue.value ? { color: colorValue.value } : undefined)
    .run();
});

// methods
const updateColor = (value: string) => {
  colorValue.value = value;
  if (props.isMobile) {
    props.editorInstance.chain().setColor(value).run();
  } else {
    props.editorInstance.chain().focus().setColor(value).run();
  }
};

const updateColorValue = () => {
  if (props.editorInstance.isActive('textStyle')) {
    colorValue.value = props.editorInstance.getAttributes('textStyle').color;
  } else {
    colorValue.value = undefined;
  }
};

// lifecycle hooks
watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateColorValue);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateColorValue);
    }
  },
  { immediate: true },
);

watch(
  () => props.isFormatSampleActive,
  (newValue) => {
    if (!newValue) {
      colorValue.value = props.editorInstance.getAttributes('textStyle').color;
    }
  },
  { immediate: true },
);
</script>
