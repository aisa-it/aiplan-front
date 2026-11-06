<template>
  <EditorToolbarButton
    icon="picture"
    tooltip="Загрузить изображение"
    @click="openFileDialog"
  />

  <input
    ref="fileInput"
    accept="image/*"
    class="editor-image-upload__input"
    multiple
    type="file"
    @change="handleFiles"
  />
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { ref } from 'vue';

import { insertImageFiles } from '../extensions/EditorImage';
import EditorToolbarButton from './EditorToolbarButton.vue';

const props = defineProps<{
  editor: Editor;
}>();

const fileInput = ref<HTMLInputElement>();

const openFileDialog = () => fileInput.value?.click();

const handleFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  input.value = '';
  await insertImageFiles(props.editor, files);
};
</script>

<style scoped>
.editor-image-upload__input {
  display: none;
}
</style>
