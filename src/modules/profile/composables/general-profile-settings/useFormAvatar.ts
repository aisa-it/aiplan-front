import { onBeforeUnmount, ref } from 'vue';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

type UseFormAvatarOptions = {
  updateUser: (data: Partial<DtoUser>) => void;
};

export function useFormAvatar({ updateUser }: UseFormAvatarOptions) {
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
      // await userStore.deleteUserAvatar(); // TODO: подключить после настройки авторизации.
      clearAvatarPreview();
      updateUser({ avatar_id: null, avatar: '' });
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
