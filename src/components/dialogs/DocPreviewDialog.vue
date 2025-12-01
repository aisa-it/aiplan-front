<template>
  <q-dialog>
    <div v-if="isVideo">
      <video
        :src="src"
        muted
        playsinline
        controls
        class="video-preview"
      ></video>
    </div>

    <div v-else-if="isDocument">
      <iframe :src="src"></iframe>
    </div>

    <div v-else-if="isAudio">
      <audio :src="src" controls />
    </div>

    <div v-else-if="isIFrame">
      <iframe :src="src" sandbox="allow-scripts" />
    </div>

    <q-card
      v-else
      class="zoom-img-wrapper flex items-center justify-center"
      :class="{ document: isDocument, 'zoom-preview--loading': isImageLoading }"
    >
      <ZoomImg
        ref="zoomImgRef"
        class="zoom-img-container flex items-center justify-center"
        zoom-type="drag"
        trigger="click"
        fit="contain"
        :src="src"
        :zoom-scale="3"
        :step="1"
        :show-zoom-btns="!isImageLoading"
        :class="{
          'zoom-preview--loading': isImageLoading,
          diagram: isDiagram,
        }"
        @load="
          () => {
            isImageLoading = false;
          }
        "
      >
        <template #loading>
          <DefaultLoader />
        </template>
      </ZoomImg>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import { computed, ref } from 'vue';
import { ZoomImg } from 'vue3-zoomer';

// utils
import {
  EXTENSION_DOCUMENT,
  EXTENSION_VIDEO,
  EXTENSION_AUDIO,
  EXTENSION_IFRAME,
} from 'src/constants/constants';
import DefaultLoader from '../loaders/DefaultLoader.vue';

// props
const props = defineProps<{
  file: Record<string, any>;
  isDiagram?: boolean;
}>();

//constansts
const prefix = '/api/auth/file/';

// vars
const zoomImgRef = ref<InstanceType<typeof ZoomImg> | null>(null);
const isImageLoading = ref(true);

// helpers
const getIsExtension = (extension: string[]): boolean => {
  if (typeof props.file.asset === 'object') {
    const extensionAsset =
      props.file?.asset.name.split('.').pop()?.toLowerCase() || '';
    return extension.includes(extensionAsset);
  }
  return false;
};

// computed
const isVideo = computed(() => getIsExtension(EXTENSION_VIDEO));
const isDocument = computed(() => getIsExtension(EXTENSION_DOCUMENT));
const isAudio = computed(() => getIsExtension(EXTENSION_AUDIO));
const isIFrame = computed(() => getIsExtension(EXTENSION_IFRAME));

const src = computed(() => {
  if (props.file?.asset?.id) {
    return prefix + props.file.asset.id;
  }
  return props.file?.asset || '';
});
</script>

<style lang="scss"></style>
<style lang="scss" scoped>
.zoom-img-wrapper {
  height: fit-content;
  width: fit-content;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;

  .zoom-preview--loading {
    min-width: 300px;
    min-height: 300px;
  }
}
:deep(.vz-zoomimg-img-container) {
  display: flex;
}

:deep(.vz-zoomimg-img) {
  object-fit: contain;
  max-width: 90vw;
  max-height: 80vh;
  height: fit-content;
  width: fit-content;
}

.diagram :deep(.vz-zoomimg-img) {
  padding: 16px;
  min-width: 90vw;
}

iframe {
  height: 80vh !important;
  width: 80vw !important;
}

.q-dialog__inner--minimized > div {
  max-width: 90vw;
}

:deep(.q-img) {
  div:first-child {
    padding-bottom: 0 !important;
  }
  .q-img__container {
    position: relative;
  }
}
.video-preview {
  max-width: 80vw;
  max-height: 60vh;
}

@media screen and (max-width: 1280px) {
  .video-preview {
    max-width: 80vw;
    max-height: 60vh;
  }

  :deep(.vz-zoomimg-img) {
    min-width: auto;
    min-height: auto;
  }
}
</style>
