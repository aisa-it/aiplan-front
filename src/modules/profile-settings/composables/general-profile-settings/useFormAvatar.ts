import { Ref, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';

import { SUCCESS_DELETE_IMG_PROFILE } from 'src/constants/notifications';
import { IUser } from 'src/interfaces/users';

export const useFormAvatar = (userInfo: Ref<Partial<IUser>>) => {
  // Работа с изображением (аватаром) пользователя
  const { setNotificationView } = useNotificationStore();
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const loading = ref<boolean>(false);

  const showNotification = (type: 'success' | 'error', msg?: string) => {
    setNotificationView({
      open: true,
      type: type,
      customMessage: msg,
    });
  };

  const handleRefreshAvatar = async (): Promise<void> => {
    loading.value = true;
    await userStore
      .getUserInfo()
      .then(() => {
        userInfo.value = JSON.parse(JSON.stringify(user.value));
        loading.value = false;
      })
      .catch(() => (loading.value = false));
  };


  const deleteUserAvatar = async (): Promise<void> => {
    if (!user.value) return;

    try {
      loading.value = true;
      await userStore.deleteUserAvatar();
      await userStore
        .getUserInfo()
        .then(() => {
          userInfo.value = JSON.parse(JSON.stringify(user.value));
          loading.value = false;
        })
        .catch(() => {
          loading.value = false;
        });
      showNotification('success', SUCCESS_DELETE_IMG_PROFILE);
    } catch {}
  };

  return { loading, handleRefreshAvatar, deleteUserAvatar };
};
