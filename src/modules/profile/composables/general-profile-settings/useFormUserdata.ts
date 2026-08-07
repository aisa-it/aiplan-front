import { reactive, ref, watch, type Ref } from 'vue';

import { isEmail } from '@/utils/validation';

import { useProfileValidationRules } from '../useProfileValidationRules';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

type FormRef = {
  validate: () => Promise<{ valid: boolean }>;
};

type UseFormUserdataOptions = {
  user: Ref<DtoUser>;
  updateUser: (data: Partial<DtoUser>) => void;
};

export function useFormUserdata({
  user,
  updateUser,
}: UseFormUserdataOptions) {
  const form = reactive({
    email: '',
    firstName: '',
    lastName: '',
    telegramId: '',
    timezone: '',
    username: '',
  });

  const formRef = ref<FormRef | null>(null);
  const emailLoading = ref(false);
  const isUploaderOpen = ref(false);
  const saving = ref(false);
  const telegramBotUrl = ref('');
  const usernameError = ref('');

  const {
    emailRules,
    firstNameRules,
    lastNameRules,
    telegramIdRules,
    usernameRules,
  } = useProfileValidationRules();

  const fillForm = (value: DtoUser) => {
    form.email = value.email ?? '';
    form.firstName = value.first_name ?? '';
    form.lastName = value.last_name ?? '';
    form.telegramId = value.telegram_id?.toString() ?? '';
    form.timezone = value.user_timezone ?? 'Europe/Moscow';
    form.username = value.username ?? '';
  };

  const toggleUploaderState = () => {
    isUploaderOpen.value = !isUploaderOpen.value;
  };

  const setFormRef = (value: unknown) => {
    formRef.value = value as FormRef | null;
  };

  const handleUpdateUserName = () => {
    usernameError.value = '';
  };

  const updateCurrentUser = async () => {
    const result = await formRef.value?.validate();
    if (!result?.valid) return;

    saving.value = true;
    usernameError.value = '';

    try {
      const data = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        telegram_id: form.telegramId ? Number(form.telegramId) : null,
        user_timezone: form.timezone,
        username: form.username.trim(),
      };

      // await userStore.updateCurrentUser(data); // TODO: подключить после настройки авторизации.
      updateUser(data);
      // TODO: показать уведомление SUCCESS_UPDATE_DATA после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: обработать ERROR_IDENTITY_USER и показать уведомление после переноса системы уведомлений.
    } finally {
      saving.value = false;
    }
  };

  const changeEmail = async () => {
    const email = form.email.trim();
    if (isEmail(email) !== true) return;

    emailLoading.value = true;
    try {
      // await ProfileService.changeEmail({ new_email: email }); // TODO: подключить после настройки авторизации.
      // TODO: показать уведомление об отправке ссылки после переноса системы уведомлений.
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      emailLoading.value = false;
    }
  };

  watch(
    () => [
      user.value.email,
      user.value.first_name,
      user.value.last_name,
      user.value.telegram_id,
      user.value.user_timezone,
      user.value.username,
    ],
    () => fillForm(user.value),
    { immediate: true },
  );

  // TODO: загрузить ссылку через ProfileService.getTelegramBotUrl после настройки авторизации.

  return {
    changeEmail,
    emailLoading,
    emailRules,
    firstNameRules,
    form,
    handleUpdateUserName,
    isUploaderOpen,
    lastNameRules,
    saving,
    setFormRef,
    telegramBotUrl,
    telegramIdRules,
    toggleUploaderState,
    updateCurrentUser,
    usernameError,
    usernameRules,
  };
}
