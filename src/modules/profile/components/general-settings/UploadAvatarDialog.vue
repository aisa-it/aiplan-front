<template>
  <v-dialog v-model="model" width="auto" max-width="720" @after-enter="reset">
    <v-card class="rounded-2xl" :class="{ 'md:min-w-xl': !image }">
      <v-card-title class="p-4 my-4 text-lg font-bold text-base">{{
        title
      }}</v-card-title>

      <v-card-text v-if="image" class="flex justify-center">
        <img
          class="max-w-full rounded-lg object-contain"
          :src="imageSrc"
          alt=""
        />
      </v-card-text>

      <v-card-text v-else>
        <label
          class="flex min-h-75 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-primary p-3 text-center"
          @dragenter.prevent="isDragActive = true"
          @dragover.prevent="isDragActive = true"
          @dragleave.prevent="isDragActive = false"
          @drop.prevent="handleDrop"
        >
          <input
            class="hidden"
            type="file"
            :accept="accept"
            @change="handleInput"
          />

          <div v-if="isValidImage" class="text-primary">
            <p v-if="isDragActive">{{ t('profile.avatar.dropActive') }}</p>
            <p v-else>{{ t('profile.avatar.dropIdle') }}</p>
          </div>

          <v-alert
            v-else
            type="error"
            variant="tonal"
            icon="mdi-alert-circle-outline"
            class="max-w-[360px] text-left"
            :title="t('profile.avatar.errorTitle')"
            :text="
              isProfile
                ? t('profile.avatar.errorHintWithLimit')
                : t('profile.avatar.errorHint')
            "
          />
        </label>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          width="110"
          class="normal-case"
          variant="outlined"
          :disabled="loading"
          @click="model = false"
        >
          {{ t('common.actions.cancel') }}
        </v-btn>
        <v-btn
          width="110"
          color="primary"
          variant="flat"
          class="rounded-lg px-2 py-0 min-w-0"
          :disabled="!image"
          :loading="loading"
          @click="onUpload"
        >
          {{ t('common.actions.upload') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useAvatarUpload } from '../../composables/general-profile-settings/useAvatarUpload';

const props = withDefaults(
  defineProps<{
    title?: string;
    isProfile?: boolean;
    loading?: boolean;
  }>(),
  {
    title: '',
    isProfile: false,
    loading: false,
  },
);

const model = defineModel<boolean>({ required: true });

const { t } = useI18n();
const emit = defineEmits<{
  upload: [image: File];
}>();

const {
  accept,
  handleDrop,
  handleInput,
  image,
  imageSrc,
  isDragActive,
  isValidImage,
  reset,
} = useAvatarUpload(() => props.isProfile);

const onUpload = () => {
  if (!image.value) return;

  emit('upload', image.value);
};
</script>
