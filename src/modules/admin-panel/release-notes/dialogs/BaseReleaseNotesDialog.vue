<template>
  <q-card class="admin-release-note-dialog__card">
    <q-card-section>
      <EditorTipTapV2
        editor-id="release-note"
        v-model="currentContent"
        disable-images
        class="admin-release-note-dialog__editor"
        :can-edit="!readOnly"
        :read-only-editor="readOnly"
        :excluded-tabs="[TIPTAP_TABS.drawio]"
        @updateEditorDOM="updateEditorDOM"
      />
    </q-card-section>

    <q-card-actions v-if="!readOnly" align="right" class="q-px-md">
      <CancelButton @click="emitCancel" />
      <SaveButton :disable="isEditorEmpty" @click="emitSave" />
    </q-card-actions>

    <q-inner-loading :showing="loading">
      <LoaderDefault />
    </q-inner-loading>
  </q-card>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import LoaderDefault from 'src/components/loaders/DefaultLoader.vue';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import SaveButton from 'src/components/buttons/SaveButton.vue';

import { TIPTAP_TABS } from 'src/constants/tiptap';

import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import { isEditorEmpty } from 'src/components/editorV2/utils/editorUtils';

const props = withDefaults(
  defineProps<{
    initialContent?: string;
    readOnly?: boolean;
    loading?: boolean;
  }>(),
  {
    initialContent: '',
    readOnly: false,
    loading: false,
  },
);

const currentContent = ref<string>(props.initialContent);

const emits = defineEmits<{ save: [content: string]; cancel: [] }>();

const editorDOMvalue = ref();
const isEmpty = computed(() => isEditorEmpty(editorDOMvalue.value));

const updateEditorDOM = (value: boolean) => {
  editorDOMvalue.value = value;
};

const emitSave = () => {
  if (isEmpty.value || !currentContent.value) return;
  emits('save', currentContent.value);
};

const emitCancel = () => {
  emits('cancel');
};
</script>

<style scoped lang="scss">
.admin-release-note-dialog {
  &__card {
    min-width: calc(66vw - 25px);

    ::-webkit-scrollbar {
      display: block;
    }
  }
}

:deep(.html-editor__container.html-editor__readonly) {
  max-height: calc(100vh - 100px) !important;
}

@media screen and (min-width: 1024px) {
  :deep(.html-editor) {
    overflow: visible !important;
  }

  :deep(.html-editor__toolbar) {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: $bg-color;
  }
}
</style>
