<template>
  <AuthLayout>
    <template #title> Необходимо ввести Ваши данные </template>

    <template #default>
      <v-form
        ref="formRef"
        @submit.prevent="handleSave"
        class="d-flex flex-column ga-2 mt-4"
      >
        <v-text-field
          v-model="form.first_name"
          label="Введите имя *"
          data-id="first-name-onboarding"
          :rules="firstNameRules"
          :disabled="saving"
        />

        <v-text-field
          v-model="form.last_name"
          label="Введите фамилию*"
          data-id="last-name-onboarding"
          :rules="lastNameRules"
          :disabled="saving"
        />

        <v-text-field
          v-model="form.username"
          label="Введите имя пользователя*"
          data-id="user-name-onboarding"
          :rules="usernameRules"
          :error-messages="usernameError"
          :disabled="saving"
          @update:model-value="usernameError = ''"
        />

        <v-text-field
          v-model="form.telegram_id"
          label="Введите Telegram ID"
          data-id="telegram-id-settings"
          inputmode="numeric"
          :rules="telegramIdRules"
          :disabled="saving"
        >
          <template #details>
            <p class="text-xs text-secondary mt-1">
              Ваш telegram id для получения уведомлений. Напишите
              <a
                v-if="telegramBotUrl"
                :href="telegramBotUrl"
                class="text-primary text-decoration-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                боту
              </a>
              <span v-else>боту</span>
              для получения id.
            </p>
          </template>
        </v-text-field>

        <v-btn
          class="rounded-lg text-sm tracking-wide mt-4 text-none"
          color="primary"
          type="submit"
          data-id="save-name"
          size="large"
          block
          :loading="saving"
          :disabled="isSubmitDisabled"
        >
          Сохранить
        </v-btn>
      </v-form>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AuthLayout } from '@/modules/auth';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';
import { useProfileValidationRules } from '@/modules/profile/composables/useProfileValidationRules';
import { ProfileService } from '@/modules/profile/api/profile.service';
import { ERROR_IDENTITY_USER } from '@/constants/notifications';

const router = useRouter();
const userStore = useUserStore();
const workspacesStore = useWorkspacesStore();

const { firstNameRules, lastNameRules, usernameRules, telegramIdRules } =
  useProfileValidationRules();

const formRef = ref<any>(null);
const saving = ref(false);
const usernameError = ref('');
const telegramBotUrl = ref('');

const form = ref<{
  first_name: string;
  last_name: string;
  username: string;
  telegram_id: string;
}>({
  first_name: '',
  last_name: '',
  username: '',
  telegram_id: '',
});

const isSubmitDisabled = computed(() => {
  return !(
    form.value.first_name?.trim() &&
    form.value.last_name?.trim() &&
    form.value.username?.trim()
  );
});

const syncUserData = () => {
  if (userStore.user) {
    form.value.first_name = userStore.user.first_name ?? '';
    form.value.last_name = userStore.user.last_name ?? '';
    form.value.username = userStore.user.username ?? '';
    form.value.telegram_id =
      userStore.user.telegram_id !== null &&
      userStore.user.telegram_id !== undefined
        ? String(userStore.user.telegram_id)
        : '';
  }
};

const navigateToNext = async () => {
  try {
    await workspacesStore.getUserWorkspaces();
    const slug =
      userStore.user?.last_workspace_slug ||
      workspacesStore.workspaces[0]?.slug;

    await router.replace(slug ? `/${slug}` : '/');
  } catch {
    await router.replace('/');
  }
};

const handleSave = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  usernameError.value = '';

  const payload = {
    first_name: form.value.first_name.trim(),
    last_name: form.value.last_name.trim(),
    username: form.value.username.trim(),
    telegram_id: form.value.telegram_id.trim()
      ? Number(form.value.telegram_id.trim())
      : null,
  };

  try {
    await userStore.updateCurrentUser(payload);
    await navigateToNext();
  } catch (err: any) {
    if (err?.response?.status === 409 && err?.response?.data?.code === 6002) {
      usernameError.value = ERROR_IDENTITY_USER;
      return;
    }

    if (err?.response?.status === 304) {
      await navigateToNext();
      return;
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => userStore.user,
  () => {
    syncUserData();
  },
  { immediate: true },
);

onMounted(async () => {
  if (!userStore.user) {
    await userStore.getUserInfo();
  }
  syncUserData();

  telegramBotUrl.value = await ProfileService.getTelegramBotUrl();
});
</script>
