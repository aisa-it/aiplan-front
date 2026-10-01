import { onMounted, reactive, ref, watch, type Ref } from 'vue';
import { isAxiosError } from 'axios';

import { useUserStore } from '@/stores/user-store';
import { isEmail } from '@/utils/validation';

import { ProfileService } from '../../api/profile.service';
import { useProfileValidationRules } from '../useProfileValidationRules';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

type FormRef = {
  validate: () => Promise<{ valid: boolean }>;
};

type ApiErrorData = {
  code?: number;
};

export function useFormUserdata(user: Ref<DtoUser>) {
  const userStore = useUserStore();
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

      await userStore.updateCurrentUser(data);
      // TODO: показать уведомление SUCCESS_UPDATE_DATA после переноса системы уведомлений.
    } catch (error) {
      if (
        isAxiosError<ApiErrorData>(error) &&
        error.response?.status === 409 &&
        error.response.data?.code === 6002
      ) {
        usernameError.value = 'Пользователь с таким именем уже существует';
      }
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
      await ProfileService.changeEmail({ new_email: email });
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

  onMounted(async () => {
    try {
      telegramBotUrl.value = await ProfileService.getTelegramBotUrl();
    } catch (error) {
      void error;
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    }
  });

  return {
    changeEmail,
    emailLoading,
    emailRules,
    firstNameRules,
    form,
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
