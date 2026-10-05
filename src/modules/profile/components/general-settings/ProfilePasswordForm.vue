<template>
  <section class="pt-4" aria-labelledby="password-heading">
    <h3 id="password-heading" class="text-2xl font-medium">Смена пароля</h3>

    <v-form :ref="setFormRef" @submit.prevent="changePassword">
      <ProfileSettingsRow
        title="Новый пароль"
        description="Введите новый пароль"
      >
        <v-text-field
          v-model="password.new_password"
          label="Введите пароль"
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
        title="Новый пароль (повторно)"
        description="Введите новый пароль ещё раз"
      >
        <v-text-field
          v-model="password.confirm_password"
          label="Введите пароль"
          autocomplete="new-password"
          data-id="repeat-password-settings"
          :type="isRepeatNewPassword ? 'password' : 'text'"
          :rules="confirmPasswordRules"
          :disabled="loading"
          :append-inner-icon="
            isRepeatNewPassword ? 'mdi-eye-off' : 'mdi-eye'
          "
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
          Сменить пароль
        </v-btn>
      </div>
    </v-form>
  </section>
</template>

<script setup lang="ts">
import ProfileSettingsRow from './ProfileSettingsRow.vue';

import { useFormPassword } from '../../composables/general-profile-settings/useFormPassword';

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
