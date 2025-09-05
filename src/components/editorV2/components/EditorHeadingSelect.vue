<template>
  <q-select
    v-model="headingValue"
    ref="headingMenu"
    class="html-editor__select"
    :options="listHeading"
    hide-dropdown-icon
    options-dense
    :popup-content-class="`html-editor__select-option scrollable-content ${classPrevent}`"
    @update:model-value="updateHeading($event)"
    @popup-show="isOpenSelect = true"
    @popup-hide="isOpenSelect = false"
  >
    <HintTooltip>Заголовок</HintTooltip>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <div
            class="row centered-horisontally html-editor__heading"
            v-html="getHeadingOption(scope.opt)"
          ></div>
        </q-item-section>
      </q-item>
    </template>

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
import { ref, watch } from 'vue';
// utils
import { ListHeading } from 'src/components/editorV2/utils/tiptap';
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
const listHeading = ListHeading;
const defaultHeadingValue = listHeading[0];
const headingValue = ref(defaultHeadingValue);
const isOpenSelect = ref(false);
const headingMenu = ref<QSelect>();
// function
if (!props.isMobile) useMenuHandler(headingMenu);

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
    headingValue.value = currentVal;
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
