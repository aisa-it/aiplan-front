<template>
  <UploadAvatarDialog
    v-model="model"
    title="Загрузить аватар (не более 20 Мб)"
    is-profile
    @upload="handleUploadUserAvatar"
  />
</template>

<script setup lang="ts">
import UploadAvatarDialog from './UploadAvatarDialog.vue';

const model = defineModel<boolean>({ required: true });
const emit = defineEmits<{
  uploaded: [image: File];
}>();

const handleUploadUserAvatar = async (image: File) => {
  if (!image) return;

  // await userStore.uploadUserAvatar({ file: image }); // TODO: подключить после настройки авторизации.
  emit('uploaded', image);
  // TODO: показать уведомление SUCCESS_CREATE_IMG_PROFILE после переноса системы уведомлений.
};
</script>
