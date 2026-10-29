<template>
  <UploadAvatarDialog
    v-model="model"
    :title="t('profile.avatar.dialogTitle')"
    is-profile
    :loading="loading"
    @upload="handleUploadUserAvatar"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useUserStore } from '@/stores/user-store';

import { ProfileService } from '../../api/profile.service';
import UploadAvatarDialog from './UploadAvatarDialog.vue';
import { toast } from '@/modules/toast';
import { i18n } from '@/i18n';

const { t } = useI18n();

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
    toast.success(i18n.global.t('profile.toast.imageUploaded'));
  } catch {
  } finally {
    loading.value = false;
  }
};
</script>
