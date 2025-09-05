<template>
  <q-btn-dropdown
    dense
    flat
    :disable="!isDisabled"
    :content-class="classPrevent"
  >
    <template #label>
      <HintTooltip>Выделить</HintTooltip>
      <span :style="{ color: bgColorValue }">
        <component :is="ICONS.fontBgIcon" />
      </span>
    </template>

    <ColorPicker
      :model-value="bgColorValue"
      @select-bg-color="updateBgColor"
      :is-bg-color="true"
      :is-spoiler="false"
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

interface IEditorBgColorPickerProps {
  editorInstance: Editor;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}

const props = withDefaults(defineProps<IEditorBgColorPickerProps>(), {
  isFormatSampleActive: false,
  isMobile: false,
});

// state
const bgColorValue = shallowRef<string | undefined>();

// computed
const isDisabled = computed(() => {
  return props.editorInstance
    .can()
    .chain()
    .focus()
    .setHighlight(
      bgColorValue.value ? { color: bgColorValue.value } : undefined,
    )
    .run();
});

// methods
const updateBgColor = (value: string) => {
  bgColorValue.value = value;
  if (props.isMobile) {
    props.editorInstance?.chain().setHighlight({ color: value }).run();
  } else {
    props.editorInstance?.chain().focus().setHighlight({ color: value }).run();
  }
};

const updateBgColorValue = () => {
  if (props.editorInstance.isActive('highlight')) {
    bgColorValue.value = props.editorInstance.getAttributes('highlight').color;
  } else {
    bgColorValue.value = undefined;
  }
};

// lifecycle hook
watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateBgColorValue);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateBgColorValue);
    }
  },
  { immediate: true },
);

watch(
  () => props.isFormatSampleActive,
  (newValue) => {
    if (!newValue) {
      bgColorValue.value =
        props.editorInstance.getAttributes('highlight').color;
    }
  },
  { immediate: true },
);
</script>
