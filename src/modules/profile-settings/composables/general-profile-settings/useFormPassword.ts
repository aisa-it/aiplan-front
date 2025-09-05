import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';

import { SUCCESS_IDENTITY_PASSWORD } from 'src/constants/notifications';

import { AiplanPasswordRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useFormPassword = () => {
  // Настройки пароля пользователя
  const userStore = useUserStore();
  const router = useRouter();
  const { setNotificationView } = useNotificationStore();

  const password = ref<AiplanPasswordRequest>({
    new_password: undefined as unknown as string,
    confirm_password: undefined as unknown as string,
  });
  const isNewPassword = ref<boolean>(true);
  const isRepeatNewPassword = ref<boolean>(true);

  const showNotification = (type: 'success' | 'error', msg?: string): void => {
    setNotificationView({
      open: true,
      type: type,
      customMessage: msg,
    });
  };

  const changePassword = async (): Promise<void> => {
    if (password.value.new_password !== password.value.confirm_password) {
      return;
    }

    await userStore
      .changeMyPassword(password.value)
      .then(async () => {
        localStorage.removeItem('next_url');
        router.replace('/signin');
        // await aiplanStore.signOut()
      })
      .then(() => showNotification('success', SUCCESS_IDENTITY_PASSWORD));
  };

  return { password, isNewPassword, isRepeatNewPassword, changePassword };
};
