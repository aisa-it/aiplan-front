<template>
  <UploadAvatarDialog
    v-model="model"
    title="Загрузить аватар (не более 20 Мб)"
    is-profile
    :loading="loading"
    @upload="handleUploadUserAvatar"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useUserStore } from '@/stores/user-store';

import { ProfileService } from '../../api/profile.service';
import UploadAvatarDialog from './UploadAvatarDialog.vue';
import { toast } from '@/modules/toast';
import { SUCCESS_CREATE_IMG_PROFILE } from '@/constants/notifications';

const model = defineModel<boolean>({ required: true });
const userStore = useUserStore();
const loading = ref(false);
const emit = defineEmits<{
  uploaded: [image: File];
}>();

const handleUploadUserAvatar = async (image: File) => {
  if (!image) return;

  loading.value = true;
  try {
    const updatedUser = await ProfileService.uploadAvatar(image);
    userStore.replaceUser(updatedUser);
    emit('uploaded', image);
    model.value = false;
    toast.success(SUCCESS_CREATE_IMG_PROFILE);
  } catch {
  } finally {
    loading.value = false;
  }
};
</script>
