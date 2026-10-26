import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { ProfileService } from '../../api/profile.service';
import { useProfileValidationRules } from '../useProfileValidationRules';

type FormRef = {
  validate: () => Promise<{ valid: boolean }>;
};

export function useFormPassword() {
  const router = useRouter();
  const { t } = useI18n();
  const formRef = ref<FormRef | null>(null);
  const password = ref({
    new_password: '',
    confirm_password: '',
  });
  const isNewPassword = ref(true);
  const isRepeatNewPassword = ref(true);
  const loading = ref(false);

  const { passwordRules } = useProfileValidationRules();
  const confirmPasswordRules = computed(() => [
    ...passwordRules,
    (value: string) =>
      value === password.value.new_password ||
      t('profile.validation.passwordsMismatch'),
  ]);

  const setFormRef = (value: unknown) => {
    formRef.value = value as FormRef | null;
  };

  const changePassword = async () => {
    const result = await formRef.value?.validate();
    if (!result?.valid) return;

    loading.value = true;
    try {
      await ProfileService.changePassword(password.value);
      password.value.new_password = '';
      password.value.confirm_password = '';
      localStorage.removeItem('next_url');
      await router.replace('/signin');
      // TODO: показать уведомление SUCCESS_IDENTITY_PASSWORD после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      loading.value = false;
    }
  };

  return {
    changePassword,
    confirmPasswordRules,
    isNewPassword,
    isRepeatNewPassword,
    loading,
    password,
    passwordRules,
    setFormRef,
  };
}
