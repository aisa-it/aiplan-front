import { onMounted, ref } from 'vue';

import { ProfileService } from '../../api/profile.service';
import { toast } from '@/modules/toast';
import {
  SUCCES_COPY_TOKEN_USER,
  SUCCESS_RESET_TOKEN_USER,
} from '@/constants/notifications';

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
      toast.success(SUCCES_COPY_TOKEN_USER);
    } catch {
      toast.error();
    }
  };

  const handleResetProfileToken = async () => {
    tokenResetting.value = true;
    try {
      authToken.value = await ProfileService.resetAuthToken();
      toast.success(SUCCESS_RESET_TOKEN_USER);
    } catch {
    } finally {
      tokenResetting.value = false;
    }
  };

  onMounted(async () => {
    try {
      authToken.value = await ProfileService.getAuthToken();
    } catch {
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
