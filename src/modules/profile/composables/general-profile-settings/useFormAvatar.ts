import { onBeforeUnmount, ref } from 'vue';

import { useUserStore } from '@/stores/user-store';

import { ProfileService } from '../../api/profile.service';
import { toast } from '@/modules/toast';
import { SUCCESS_DELETE_IMG_PROFILE } from '@/constants/notifications';

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
      toast.success(SUCCESS_DELETE_IMG_PROFILE);
    } catch {
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
