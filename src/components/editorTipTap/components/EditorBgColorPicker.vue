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
        <HintTooltip>Выделить</HintTooltip>
        <span :style="{ color: bgColorValue }">
          <component :is="ICONS.fontBgIcon" />
        </span>
      </v-btn>
    </template>

    <v-card :class="classPrevent">
      <ColorPicker
        :model-value="bgColorValue"
        @select-bg-color="updateBgColor"
        :is-bg-color="true"
        :is-spoiler="false"
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
