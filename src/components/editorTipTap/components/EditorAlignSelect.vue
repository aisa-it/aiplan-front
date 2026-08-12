<template>
  <v-select
    v-model="alignValue"
    :items="alignOptions"
    item-value="value"
    return-object
    variant="plain"
    density="compact"
    hide-details
    menu-icon=""
    class="html-editor__select-sm"
    :menu-props="{
      contentClass: `html-editor__select-option scrollable-content ${classPrevent}`,
    }"
    :disabled="canChangeAlign"
    @update:model-value="updateAlign($event)"
  >
    <HintTooltip>{{ alignValue.tooltip }}</HintTooltip>

    <template #selection>
      <component :is="alignValue.icon" />
    </template>

    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="undefined">
        <HintTooltip>{{ item.tooltip }}</HintTooltip>
        <component :is="item.icon" />
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed, shallowRef, watch } from 'vue';

// components
import HintTooltip from './HintTooltip.vue';

// utils
import { ListAlign } from '../utils/tiptap';

const props = defineProps<{
  editorInstance: Editor | null;
  classPrevent?: string;
  isMobile: boolean;
}>();

// vars
const alignOptions = ListAlign as Array<{
  value: string;
  icon: unknown;
  tooltip: string;
}>;
const alignValue = shallowRef(alignOptions[0]);

const canChangeAlign = computed(() => {
  return props.editorInstance?.isActive('codeBlock');
});

// function
const updateAlign = (value: any) => {
  alignValue.value = value;

  let align = value.value;

  if (align === '') {
    align = 'left';
  }

  if (props.isMobile) {
    props.editorInstance?.chain().setTextAlign(align).run();
  } else {
    props.editorInstance?.chain().focus().setTextAlign(align).run();
  }
};

const updateAlignValue = () => {
  const currentAlign = props.editorInstance?.isActive({
    textAlign: 'center',
  })
    ? 'center'
    : props.editorInstance?.isActive({ textAlign: 'right' })
      ? 'right'
      : props.editorInstance?.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left';

  const alignOption = alignOptions.find(
    (option) => option.value === currentAlign,
  );
  if (alignOption) {
    alignValue.value = alignOption;
  }
};

// hook
watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateAlignValue);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateAlignValue);
    }
  },
  {
    immediate: true,
  },
);
</script>
