<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        size="small"
        density="compact"
        :disabled="!isDisabled"
      >
        <HintTooltip>Цвет шрифта</HintTooltip>
        <span :style="{ color: colorValue }">
          <component :is="ICONS.fontColorIcon" />
        </span>
      </v-btn>
    </template>

    <v-card :class="classPrevent">
      <ColorPicker
        :model-value="colorValue"
        @select-text-color="updateColor"
        :is-bg-color="false"
        :is-spoiler="false"
        :class-prevent="classPrevent"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
//core
import { shallowRef, watch, computed } from 'vue';
import { Editor } from '@tiptap/vue-3';
//icons
import { ICONS } from '@/utils/icons';
//components
import HintTooltip from './HintTooltip.vue';
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
