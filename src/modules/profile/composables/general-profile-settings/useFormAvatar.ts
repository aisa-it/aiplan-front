import { onBeforeUnmount, ref } from 'vue';

import { useUserStore } from '@/stores/user-store';

import { ProfileService } from '../../api/profile.service';

export function useFormAvatar() {
  const userStore = useUserStore();
  const avatarDeleting = ref(false);
  const avatarPreviewUrl = ref('');

  const clearAvatarPreview = () => {
    if (!avatarPreviewUrl.value) return;

    URL.revokeObjectURL(avatarPreviewUrl.value);
    avatarPreviewUrl.value = '';
  };

  const handleRefreshAvatar = (file: File) => {
    clearAvatarPreview();
    avatarPreviewUrl.value = URL.createObjectURL(file);
  };

  const deleteUserAvatar = async () => {
    avatarDeleting.value = true;
    try {
      const updatedUser = await ProfileService.deleteAvatar();
      userStore.replaceUser(updatedUser);
      clearAvatarPreview();
      // TODO: показать уведомление SUCCESS_DELETE_IMG_PROFILE после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      avatarDeleting.value = false;
    }
  };

  onBeforeUnmount(clearAvatarPreview);

  return {
    avatarDeleting,
    avatarPreviewUrl,
    deleteUserAvatar,
    handleRefreshAvatar,
  };
}
