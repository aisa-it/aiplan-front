import { onMounted, ref } from 'vue';

import { ProfileService } from '../../api/profile.service';
import { toast } from '@/modules/toast';
import { i18n } from '@/i18n';

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
      toast.success(i18n.global.t('profile.toast.tokenCopied'));
    } catch {
      toast.error();
    }
  };

  const handleResetProfileToken = async () => {
    tokenResetting.value = true;
    try {
      authToken.value = await ProfileService.resetAuthToken();
      toast.success(i18n.global.t('profile.toast.tokenReset'));
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
