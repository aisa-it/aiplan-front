<template>
  <div class="column">
    <span class="sub-title">
      Возможные форматы:
      <b class="cursor-pointer" @click="showFormatsDialog = true">показать</b>
    </span>
    <span class="sub-title">
      Максимальный размер одного файла: {{ maxSizeValue }}{{ maxSizeUnit }}
    </span>
    <q-dialog v-model="showFormatsDialog">
      <q-card class="inner-modal-card">
        <q-card-section class="column q-pt-none">
          <h6 class="q-ml-md">Возможные форматы</h6>
          <div class="q-mt-xs">
            <b>Документы:</b> {{ getFormats(docsFormats) }}
          </div>
          <div class="q-mt-xs">
            <b>Изображения:</b>
            {{ getFormats(imagesFormats) }}
          </div>
          <div class="q-mt-xs">
            <b>Архивы:</b> {{ getFormats(archivesFormats) }}
          </div>
          <div class="q-mt-xs">
            <b>Аудио:</b> {{ getFormats(audioFormats) }}
          </div>
          <div class="q-mt-xs">
            <b>Видео:</b> {{ getFormats(videoFormats) }}
          </div>
          <div class="q-mt-xs">
            <b>Другие:</b> {{ getFormats(otherFormats) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            no-caps
            label="Закрыть"
            class="secondary-btn"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  AIDOC_ACCEPTABLE_FORMATS_DOCS,
  AIDOC_ACCEPTABLE_FORMATS_IMAGES,
  AIDOC_ACCEPTABLE_FORMATS_ARCHIVES,
  AIDOC_ACCEPTABLE_FORMATS_AUDIO,
  AIDOC_ACCEPTABLE_FORMATS_VIDEO,
  AIDOC_ACCEPTABLE_FORMATS_OTHER,
  MAX_SIZE_FILE_VALUE,
  MAX_SIZE_FILE_UNIT,
} from 'src/constants/aidocFiles';

interface IAttachmentsInfoProps {
  docsFormats?: string[];
  imagesFormats?: string[];
  archivesFormats?: string[];
  audioFormats?: string[];
  videoFormats?: string[];
  otherFormats?: string[];
  maxSizeValue?: number;
  maxSizeUnit?: string;
}

const props = withDefaults(defineProps<IAttachmentsInfoProps>(), {
  docsFormats: () => AIDOC_ACCEPTABLE_FORMATS_DOCS,
  imagesFormats: () => AIDOC_ACCEPTABLE_FORMATS_IMAGES,
  archivesFormats: () => AIDOC_ACCEPTABLE_FORMATS_ARCHIVES,
  audioFormats: () => AIDOC_ACCEPTABLE_FORMATS_AUDIO,
  videoFormats: () => AIDOC_ACCEPTABLE_FORMATS_VIDEO,
  otherFormats: () => AIDOC_ACCEPTABLE_FORMATS_OTHER,
  maxSizeValue: MAX_SIZE_FILE_VALUE,
  maxSizeUnit: MAX_SIZE_FILE_UNIT,
});

const showFormatsDialog = ref(false);

const getFormats = (array: string[]) => {
  return array.map((el) => '.' + el).join(', ');
};
</script>
