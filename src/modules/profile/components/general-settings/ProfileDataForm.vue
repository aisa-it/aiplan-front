<template>
  <section>
    <v-form :ref="setFormRef" @submit.prevent="updateCurrentUser">
      <ProfileSettingsRow
        :title="t('common.fields.avatar')"
        :description="t('profile.avatar.description')"
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
            {{ t('common.actions.upload') }}
          </v-btn>
          <v-btn
            v-if="user.avatar_id || avatarPreviewUrl"
            class="normal-case"
            color="error"
            :loading="avatarDeleting"
            @click="deleteUserAvatar"
          >
            {{ t('common.actions.delete') }}
          </v-btn>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('common.fields.fullName')"
        :description="t('profile.data.fullName.description')"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <v-text-field
            v-model="form.firstName"
            :label="t('profile.data.fullName.firstNameLabel')"
            data-id="first-name-settings"
            :rules="firstNameRules"
            :disabled="saving"
          />
          <v-text-field
            v-model="form.lastName"
            :label="t('profile.data.fullName.lastNameLabel')"
            data-id="last-name-settings"
            :rules="lastNameRules"
            :disabled="saving"
          />
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('common.fields.email')"
        :description="t('profile.data.email.description')"
      >
        <div class="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <v-text-field
            v-model="form.email"
            :label="t('profile.data.email.label')"
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
            {{ t('common.actions.change') }}
          </v-btn>
        </div>
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('common.fields.username')"
        :description="t('profile.data.username.description')"
      >
        <v-text-field
          v-model="form.username"
          :label="t('profile.data.username.label')"
          data-id="user-name-settings"
          :rules="usernameRules"
          :error-messages="usernameError"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow :title="t('common.fields.telegramId')">
        <template #description>
          <i18n-t
            keypath="profile.data.telegramId.description"
            tag="p"
            class="mt-1 text-sm text-secondary"
            scope="global"
          >
            <template #bot>
              <a
                v-if="telegramBotUrl"
                :href="telegramBotUrl"
                class="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('profile.data.telegramId.bot') }}
              </a>
              <span v-else>{{ t('profile.data.telegramId.bot') }}</span>
            </template>
          </i18n-t>
        </template>

        <v-text-field
          v-model="form.telegramId"
          :label="t('profile.data.telegramId.label')"
          data-id="telegram-id-settings"
          inputmode="numeric"
          :rules="telegramIdRules"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('common.fields.timezone')"
        :description="t('profile.data.timezone.description')"
      >
        <v-select
          v-model="form.timezone"
          :label="t('profile.data.timezone.label')"
          :items="timezoneItems"
          :disabled="saving"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('common.fields.token')"
        :description="t('profile.data.token.description')"
      >
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
                :aria-label="t('profile.data.token.reset')"
                :loading="tokenResetting"
                :disabled="tokenLoading"
                @click="handleResetProfileToken"
              />
              <v-btn
                icon="mdi-content-copy"
                variant="outlined"
                size="small"
                data-id="copy-token-settings"
                :aria-label="t('profile.data.token.copy')"
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
          {{ t('common.actions.save') }}
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
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

const timezoneItems = computed(() =>
  TIMEZONES.map((tz) => ({
    title: `${tz.offset} ${t(`timezones.${tz.key}`)}`,
    value: tz.value,
  })),
);

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
