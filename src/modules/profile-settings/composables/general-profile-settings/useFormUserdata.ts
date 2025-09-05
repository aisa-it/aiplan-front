import { computed, ref, Ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';

import {
  SUCCESS_UPDATE_DATA,
  ERROR_IDENTITY_USER,
} from 'src/constants/notifications';
import { getFirstSymbol } from 'src/utils/helpers';
import { IUser } from 'src/interfaces/users';
import { PromiseError } from '../../types/promise-error';

export const useFormUserdata = (
  userInfo: Ref<Partial<IUser>>,
) => {
  // Основные данные пользователя
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);
  const { setNotificationView } = useNotificationStore();

  const isErrorUserName = ref<boolean>(false);
  const errorMessageUserName = ref<string>('');
  const isUploaderOpen = ref<boolean>(false);

  const showNotification = (type: 'success' | 'error', msg?: string) => {
    setNotificationView({
      open: true,
      type: type,
      customMessage: msg,
    });
  };

  const toggleUploaderState = ():void => {
    isUploaderOpen.value = !isUploaderOpen.value
  }

  const validateTelegramId = (val: string): string | boolean => {
    return (
      !val || !isNaN(Number(val)) || 'Telegram ID может содержать только цифры'
    );
  };

  const handleUpdateUserName = (): void => {
    isErrorUserName.value = false;
    errorMessageUserName.value = '';
  };

  const userNameFirstSymbol = computed<string>(() => {
    return (
      getFirstSymbol(user.value.last_name) +
      ' ' +
      getFirstSymbol(user.value.first_name)
    );
  });

  const updateCurrentUser = async (): Promise<void> => {
    await userStore
      .updateCurrentUser({
        username: userInfo.value.username,
        first_name: userInfo.value.first_name,
        last_name: userInfo.value.last_name,
        telegram_id: !userInfo.value.telegram_id
          ? 0
          : +userInfo.value.telegram_id,
        user_timezone: userInfo.value.user_timezone,
      })
      .then(() => {
        showNotification('success', SUCCESS_UPDATE_DATA);
      })
      .catch((error: PromiseError) => {
        if (
          error?.response?.status === 409 &&
          error.response.data.code === 6002
        ) {
          isErrorUserName.value = true;
          errorMessageUserName.value = ERROR_IDENTITY_USER;

          return;
        }
      });
  };

  return {
    isUploaderOpen,
    errorMessageUserName,
    isErrorUserName,
    userNameFirstSymbol,
    toggleUploaderState,
    validateTelegramId,
    handleUpdateUserName,
    updateCurrentUser,
  };
};
