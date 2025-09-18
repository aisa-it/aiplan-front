<template>
  <div class="project-icon-picker">
    <div class="row items-center h-full">
      <div class="project-preview-img-container flex q-mr-md">
        <q-img
          v-if="isImage"
          :src="previewUrl"
          width="72px"
          height="72px"
          class="project-preview-img"
          fit="contain"
        />
        <DefaultImageIcon v-else-if="!isEmoji" />
        <div v-else class="emoji-label">{{ emojiLabel }}</div>
      </div>
      <q-btn
        flat
        label="Загрузить"
        class="primary-btn-sm q-mr-md"
        dense
        @click="triggerImagePicker"
      />
      <span>или</span>
      <q-btn class="btn-sm shadow-2 q-ml-md" dense>
        <div class="row items-center">
          <span>{{ emojiLabel }}</span>
          <ArrowDown />
        </div>
        <q-popup-proxy>
          <q-card
            class="fit row wrap justify-start items-start content-start emoji-card"
          >
            <q-btn
              v-for="emoji in emojiOptions"
              :key="emoji.value"
              class="col"
              flat
              @click="handleEmojiSelect(emoji)"
              :icon="emoji.label"
            />
          </q-card>
        </q-popup-proxy>
      </q-btn>
    </div>

    <q-file
      ref="fileRef"
      v-model="image"
      accept=".jpg, .png, .gif"
      style="display: none"
      @update:model-value="handleImageSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import ArrowDown from 'src/components/icons/ArrowDown.vue';
import DefaultImageIcon from 'src/components/icons/DefaultImageIcon.vue';
import { updateProjectLogo } from '../services/api';

export interface IEmoji {
  label: string;
  value: string;
}

const props = defineProps<{
  modelValue: IEmoji | File | null;
  emojiOptions: IEmoji[];
}>();

const emit = defineEmits(['update:modelValue']);

// state
const fileRef = ref();
const image = ref<File | null>(null);

// computed
const isImage = computed(() => props.modelValue instanceof File);
const isEmoji = computed(
  () => !!(props.modelValue && !(props.modelValue instanceof File)),
);

const emojiLabel = computed(() => {
  return isEmoji.value ? (props.modelValue as IEmoji).label : '😊';
});

const previewUrl = computed(() => {
  return isImage.value ? URL.createObjectURL(props.modelValue as File) : '';
});

// methods
const triggerImagePicker = () => {
  fileRef.value?.pickFiles();
};

const handleEmojiSelect = (emoji: IEmoji) => {
  emit('update:modelValue', emoji);
};

const handleImageSelect = (file: File | null) => {
  if (file) {
    emit('update:modelValue', file);
  }
};
</script>

<style scoped>
.project-icon-picker {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-items: start;
}
.emoji-card {
  max-width: 250px;
}
.project-preview-img-container {
  width: fit-content;
  height: fit-content;
  max-height: 72px;
  max-width: 100px;
  overflow: hidden;
}
</style>
