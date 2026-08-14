import { ref } from 'vue';

export function useFormToken() {
  const authToken = ref('demo-profile-token');
  const isToken = ref(true);
  const tokenResetting = ref(false);

  const toggleToken = () => {
    isToken.value = !isToken.value;
  };

  const handleCopyProfileToken = async () => {
    try {
      await navigator.clipboard.writeText(authToken.value);
      // TODO: показать уведомление SUCCES_COPY_TOKEN_USER после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    }
  };

  const handleResetProfileToken = async () => {
    tokenResetting.value = true;
    try {
      // await userStore.resetAuthToken(); // TODO: подключить после настройки авторизации.
      authToken.value = `demo-profile-token-${Date.now()}`;
      // TODO: показать уведомление SUCCESS_RESET_TOKEN_USER после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      tokenResetting.value = false;
    }
  };

  return {
    authToken,
    handleCopyProfileToken,
    handleResetProfileToken,
    isToken,
    tokenResetting,
    toggleToken,
  };
}
