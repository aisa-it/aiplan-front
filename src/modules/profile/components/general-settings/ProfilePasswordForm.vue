<template>
  <section class="pt-4" aria-labelledby="password-heading">
    <h3 id="password-heading" class="text-2xl font-medium">
      {{ t('profile.password.heading') }}
    </h3>

    <v-form :ref="setFormRef" @submit.prevent="changePassword">
      <ProfileSettingsRow
        :title="t('profile.password.new.title')"
        :description="t('profile.password.new.description')"
      >
        <v-text-field
          v-model="password.new_password"
          :label="t('profile.password.label')"
          autocomplete="new-password"
          data-id="new-password-settings"
          :type="isNewPassword ? 'password' : 'text'"
          :rules="passwordRules"
          :disabled="loading"
          :append-inner-icon="isNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="isNewPassword = !isNewPassword"
        />
      </ProfileSettingsRow>

      <ProfileSettingsRow
        :title="t('profile.password.repeat.title')"
        :description="t('profile.password.repeat.description')"
      >
        <v-text-field
          v-model="password.confirm_password"
          :label="t('profile.password.label')"
          autocomplete="new-password"
          data-id="repeat-password-settings"
          :type="isRepeatNewPassword ? 'password' : 'text'"
          :rules="confirmPasswordRules"
          :disabled="loading"
          :append-inner-icon="isRepeatNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="isRepeatNewPassword = !isRepeatNewPassword"
        />
      </ProfileSettingsRow>

      <div class="flex justify-end pt-4">
        <v-btn
          color="primary"
          class="normal-case"
          variant="outlined"
          type="submit"
          data-id="change-password-settings"
          :loading="loading"
          :disabled="
            !password.new_password ||
            !password.confirm_password ||
            password.new_password !== password.confirm_password
          "
        >
          {{ t('profile.password.submit') }}
        </v-btn>
      </div>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ProfileSettingsRow from './ProfileSettingsRow.vue';

import { useFormPassword } from '../../composables/general-profile-settings/useFormPassword';

const { t } = useI18n();

const {
  changePassword,
  confirmPasswordRules,
  isNewPassword,
  isRepeatNewPassword,
  loading,
  password,
  passwordRules,
  setFormRef,
} = useFormPassword();
</script>
