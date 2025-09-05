<template>
  <UploadAvatarDialog
    title="Загрузить аватар (не более 20 Мб)"
    is-profile
    @upload="handleUploadUserAvatar"
  />
</template>

<script setup lang="ts">
// store
import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';

// constants
import { BASE_ERROR } from 'src/constants/notifications';
import UploadAvatarDialog from 'src/components/UploadAvatarDialog.vue';

import { SUCCESS_CREATE_IMG_PROFILE } from 'src/constants/notifications';

const emits = defineEmits<{ refresh: []; startLoading: []; error: [] }>();
const userStore = useUserStore();

const { setNotificationView } = useNotificationStore();

const handleUploadUserAvatar = async (image: File) => {
  if (!image) return;

  emits('startLoading');
  await userStore
    .uploadUserAvatar({ file: image })
    .then(() => {
      emits('refresh');
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_CREATE_IMG_PROFILE,
      });
    })
    .catch(() => {
      emits('error');
    });
};
</script>
