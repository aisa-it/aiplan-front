import { onMounted, ref } from 'vue';

import { ProfileService } from '../../api/profile.service';

export function useFormToken() {
  const authToken = ref('');
  const isToken = ref(true);
  const tokenLoading = ref(true);
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
      authToken.value = await ProfileService.resetAuthToken();
      // TODO: показать уведомление SUCCESS_RESET_TOKEN_USER после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      tokenResetting.value = false;
    }
  };

  onMounted(async () => {
    try {
      authToken.value = await ProfileService.getAuthToken();
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      tokenLoading.value = false;
    }
  });

  return {
    authToken,
    handleCopyProfileToken,
    handleResetProfileToken,
    isToken,
    tokenLoading,
    tokenResetting,
    toggleToken,
  };
}
