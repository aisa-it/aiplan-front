import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';
import {
  SUCCESS_RESET_TOKEN_USER,
  SUCCES_COPY_TOKEN_USER,
} from 'src/constants/notifications';

export const useFormToken = () => {
  // Настройка токена пользователя
  const userStore = useUserStore();
  const { authToken } = storeToRefs(userStore);
  const { setNotificationView } = useNotificationStore();
  const isToken = ref<boolean>(true);

  const showNotification = (type: 'success' | 'error', msg?: string) => {
    setNotificationView({
      open: true,
      type: type,
      customMessage: msg,
    });
  };

  const toggleToken = (): void => {
    isToken.value = !isToken.value;
  };

  const handleCopyProfileToken = (): void => {
    navigator.clipboard.writeText(authToken.value).then(() => {
      showNotification('success', SUCCES_COPY_TOKEN_USER);
    });
  };

  const handleResetProfileToken = async (): Promise<void> => {
    await userStore.resetAuthToken().then(() => {
      showNotification('success', SUCCESS_RESET_TOKEN_USER);
    });
  };

  return {
    authToken,
    isToken,
    toggleToken,
    handleCopyProfileToken,
    handleResetProfileToken,
  };
};
