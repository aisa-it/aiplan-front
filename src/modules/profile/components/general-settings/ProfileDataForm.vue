<template>
  <section>
    <v-form :ref="setFormRef" @submit.prevent="updateCurrentUser">
      <ProfileSettingsRow
        title="Аватар"
        description="Поддерживается .jpg, .png и .gif не более 20 Мб."
      >
        <div class="flex flex-wrap items-center gap-3">
          <v-avatar v-if="avatarPreviewUrl" size="40" rounded="lg">
            <v-img :src="avatarPreviewUrl" cover />
          </v-avatar>
          <UserAvatar v-else :user="user" size="large" :rounded="false" />

          <v-btn
            class="normal-case"
            variant="outlined"
            @click="toggleUploaderState"
          >
            Загрузить
          </v-btn>
          <v-btn
            v-if="user.avatar_id || avatarPreviewUrl"
            class="normal-case"
            color="error"
            :loading="avatarDeleting"
            @click="deleteUserAvatar"
          >
            Удалить
          </v-btn>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow title="Полное имя" description="Ваши фамилия и имя">
        <div class="grid gap-3 sm:grid-cols-2">
          <v-text-field
            v-model="form.firstName"
            label="Введите имя"
            data-id="first-name-settings"
            :rules="firstNameRules"
            :disabled="saving"
          />
          <v-text-field
            v-model="form.lastName"
            label="Введите фамилию"
            data-id="last-name-settings"
            :rules="lastNameRules"
            :disabled="saving"
          />
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Email"
        description="Ваш адрес электронной почты"
      >
        <div class="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <v-text-field
            v-model="form.email"
            label="Введите email"
            type="email"
            :rules="emailRules"
            :disabled="emailLoading"
          />
          <v-btn
            class="mt-1 normal-case"
            variant="outlined"
            :loading="emailLoading"
            @click="changeEmail"
          >
            Изменить
          </v-btn>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Имя пользователя"
        description="Ваше имя пользователя в системе"
      >
        <v-text-field
          v-model="form.username"
          label="Введите имя пользователя"
          data-id="user-name-settings"
          :rules="usernameRules"
          :error-messages="usernameError"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow title="Telegram ID">
        <template #description>
          <p class="mt-1 text-sm text-secondary">
            Ваш telegram id для получения уведомлений. Напишите
            <a
              v-if="telegramBotUrl"
              :href="telegramBotUrl"
              class="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              боту
            </a>
            <span v-else>боту</span>
            для получения id
          </p>
        </template>

        <v-text-field
          v-model="form.telegramId"
          label="Введите Telegram ID"
          data-id="telegram-id-settings"
          inputmode="numeric"
          :rules="telegramIdRules"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow
        title="Часовой пояс"
        description="Ваш часовой пояс для отображения времени в уведомлениях"
      >
        <v-select
          v-model="form.timezone"
          label="Ваш часовой пояс"
          :items="TIMEZONES"
          item-title="label"
          item-value="value"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow title="Токен" description="Токен для авторизации">
        <v-text-field
          :model-value="authToken"
          :type="isToken ? 'password' : 'text'"
          readonly
          :loading="tokenLoading"
          :append-inner-icon="isToken ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="toggleToken"
        >
          <template #append>
            <div class="flex gap-1">
              <v-btn
                icon="mdi-lock-reset"
                color="error"
                size="small"
                data-id="reset-token-settings"
                aria-label="Сбросить токен"
                :loading="tokenResetting"
                :disabled="tokenLoading"
                @click="handleResetProfileToken"
              />
              <v-btn
                icon="mdi-content-copy"
                variant="outlined"
                size="small"
                data-id="copy-token-settings"
                aria-label="Скопировать токен"
                :disabled="tokenLoading || !authToken"
                @click="handleCopyProfileToken"
              />
            </div>
          </template>
        </v-text-field>
      </ProfileSettingsRow>

      <div class="flex justify-end pt-4">
        <v-btn
          color="primary"
          class="normal-case"
          variant="outlined"
          type="submit"
          data-id="save-button-settings"
          :loading="saving"
          :disabled="!(form.firstName && form.lastName)"
        >
          Сохранить
        </v-btn>
      </div>
    </v-form>

    <UploadUserAvatarDialog
      v-model="isUploaderOpen"
      @uploaded="handleRefreshAvatar"
    />
  </section>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

import UserAvatar from '@/components/user-avatar/UserAvatar.vue';
import { TIMEZONES } from '@/constants/timezones';

import ProfileSettingsRow from './ProfileSettingsRow.vue';
import UploadUserAvatarDialog from './UploadUserAvatarDialog.vue';

import { useFormAvatar } from '../../composables/general-profile-settings/useFormAvatar';
import { useFormToken } from '../../composables/general-profile-settings/useFormToken';
import { useFormUserdata } from '../../composables/general-profile-settings/useFormUserdata';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const user = toRef(props, 'user');

const {
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
} = useFormUserdata(user);

const {
  avatarDeleting,
  avatarPreviewUrl,
  deleteUserAvatar,
  handleRefreshAvatar,
} = useFormAvatar();

const {
  authToken,
  handleCopyProfileToken,
  handleResetProfileToken,
  isToken,
  tokenLoading,
  tokenResetting,
  toggleToken,
} = useFormToken();
</script>
