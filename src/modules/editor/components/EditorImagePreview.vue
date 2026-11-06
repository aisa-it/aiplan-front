<template>
  <v-dialog
    v-model="model"
    :width="isDiagram ? '90vw' : undefined"
    max-width="90vw"
  >
    <div
      class="editor-image-preview"
      :class="{ 'editor-image-preview--diagram': isDiagram }"
    >
      <ZoomImg
        class="editor-image-preview__zoom"
        :src="src"
        :alt="alt || 'Изображение'"
        zoom-type="drag"
        trigger="click"
        :zoom-scale="3"
        :step="1"
        :show-zoom-btns="imageLoaded"
        @load="imageLoaded = true"
      >
        <template #loading>
          <v-progress-circular indeterminate color="primary" />
        </template>
      </ZoomImg>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ZoomImg } from 'vue3-zoomer';

withDefaults(defineProps<{
  alt?: string;
  src: string;
  isDiagram?: boolean;
}>(), {
  isDiagram: false,
});

const model = defineModel<boolean>({ required: true });
const imageLoaded = ref(false);
</script>

<style scoped>
.editor-image-preview {
  display: flex;
  width: fit-content;
  max-width: 90vw;
  max-height: 80vh;
  margin: auto;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.editor-image-preview--diagram {
  width: 90vw;
  height: 80vh;
}

.editor-image-preview__zoom {
  width: 100%;
  height: 100%;
}

.editor-image-preview :deep(.vz-zoomimg-img-container) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-image-preview :deep(.vz-zoomimg-img) {
  width: auto;
  height: auto;
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
}

.editor-image-preview--diagram :deep(.vz-zoomimg-img) {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.editor-image-preview :deep(.controls-btn) {
  width: 28px;
  height: 28px;
  color: #fff;
  background-color: rgb(var(--v-theme-primary)) !important;
  border-radius: 4px;
}

.editor-image-preview :deep(.controls-btn:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-image-preview :deep(.zoom-in-btn),
.editor-image-preview :deep(.zoom-out-btn) {
  content: none !important;
}

.editor-image-preview :deep(.zoom-in-btn::before) {
  content: '+';
  font-size: 22px;
  line-height: 1;
}

.editor-image-preview :deep(.zoom-out-btn::before) {
  content: '−';
  font-size: 22px;
  line-height: 1;
}
</style>
