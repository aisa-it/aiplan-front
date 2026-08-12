<template>
  <v-select
    v-model="headingValue"
    class="html-editor__select"
    :items="listHeading"
    item-title="label"
    item-value="value"
    return-object
    variant="plain"
    density="compact"
    hide-details
    menu-icon=""
    :menu-props="{
      contentClass: `html-editor__select-option scrollable-content ${classPrevent}`,
    }"
    @update:model-value="updateHeading($event)"
    @update:menu="isOpenSelect = $event"
  >
    <HintTooltip>Заголовок</HintTooltip>

    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="undefined">
        <div
          class="row centered-horisontally html-editor__heading"
          v-html="getHeadingOption(item)"
        ></div>
      </v-list-item>
    </template>

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
import { ref, watch } from 'vue';
// components
import HintTooltip from './HintTooltip.vue';
// utils
import { ListHeading } from '../utils/tiptap';
// import { useMenuHandler } from 'src/composables/useMenuHandler'; // TODO: useMenuHandler

const props = defineProps<{
  editorInstance: Editor;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  isMobile?: boolean;
}>();

//vars
const listHeading = ListHeading as Array<{ value: number; label: string }>;
const defaultHeadingValue = listHeading[0];
const headingValue = ref(defaultHeadingValue);
const isOpenSelect = ref(false);
// const headingMenu = ref<any>(null);
// function
// if (!props.isMobile) useMenuHandler(headingMenu); // TODO: useMenuHandler

const updateHeading = (value: any) => {
  if (!value.value) {
    if (props.isMobile) {
      props.editorInstance.chain().setParagraph().run();
    } else {
      props.editorInstance.chain().focus().setParagraph().run();
    }
  } else {
    if (props.isMobile) {
      props.editorInstance.chain().toggleHeading({ level: value.value }).run();
    } else {
      props.editorInstance
        .chain()
        .focus()
        .toggleHeading({ level: value.value })
        .run();
    }
  }
};

const getHeadingOption = (option: any) => {
  return `<h${option.value}>${option.label}</h${option.value}>`;
};

const updateSelectedSize = () => {
  const { $from } = props.editorInstance.state.selection;
  if ($from.parent.type.name === 'heading') {
    const currentVal = listHeading.find(
      (el) => el.value === $from.parent.attrs.level,
    );
    headingValue.value = currentVal ?? defaultHeadingValue;
  } else {
    headingValue.value = defaultHeadingValue;
  }
};

// hook
watch(
  () => props.editorInstance,
  (newEditor, oldEditor) => {
    if (newEditor) {
      newEditor.on('selectionUpdate', updateSelectedSize);
      newEditor.on('transaction', updateSelectedSize);
    }
    if (oldEditor) {
      oldEditor.off('selectionUpdate', updateSelectedSize);
      oldEditor.off('transaction', updateSelectedSize);
    }
  },
  {
    immediate: true,
  },
);
</script>
