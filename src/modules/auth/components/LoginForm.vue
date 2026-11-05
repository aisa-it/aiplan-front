<template>
  <v-form @submit.prevent="login" class="flex flex-col content-center">
    <v-text-field
      v-model="email"
      name="email"
      autocomplete="username"
      :label="t('auth.login.emailLabel')"
      data-id="email"
      :rules="[
        (val) => (val && val.length > 0) || t('auth.login.emailRequired'),
        (val) => isEmail(val) || t('common.validation.email'),
      ]"
      :error-messages="
        loginError ? t('auth.login.invalidCredentials') : undefined
      "
      :error="loginError"
      @update:model-value="loginError = false"
      :disabled="loading"
    />

    <v-text-field
      v-if="!isRegister"
      v-model="password"
      name="password"
      autocomplete="current-password"
      :label="t('auth.login.passwordLabel')"
      :placeholder="t('auth.login.passwordPlaceholder')"
      data-id="password"
      :type="isPassword ? 'password' : 'text'"
      :rules="[
        (val) => (val && val.length > 0) || t('auth.login.passwordRequired'),
      ]"
      :error-messages="
        loginError ? t('auth.login.invalidCredentials') : undefined
      "
      :error="loginError"
      :disabled="loading"
      :append-inner-icon="isPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPassword = !isPassword"
    />

    <CaptchaWidget
      v-if="isEnabledCaptcha"
      :key="updateKey"
      @verified="(payload) => (captchaPayload = payload)"
    />

    <v-btn
      v-if="!isRegister"
      class="text-sm rounded-lg text-base"
      variant="text"
      @click="restorePassword()"
      size="large"
    >
      {{ t('auth.login.forgotPassword') }}
    </v-btn>

    <v-btn
      class="rounded-lg text-sm tracking-wide mt-4"
      type="submit"
      id="login"
      :loading="loading"
      :disabled="
        (isEnabledCaptcha && captchaPayload === '') ||
        (isRegister && !isEmail(email))
      "
      size="large"
      block
      active-color="rgba(255, 255, 255, 0.6)"
    >
      {{ isRegister ? t('auth.login.signUp') : t('auth.login.signIn') }}
    </v-btn>

    <PasswordRestoreDialog v-model="showRestoreDialog" />
  </v-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { isEmail } from '@/utils/validation';
import CaptchaWidget from './CaptchaWidget.vue';
import PasswordRestoreDialog from './PasswordRestoreDialog.vue';
import { AuthService } from '../api/auth.service';
import { useUtilsStore } from '@/stores/utils-store';
import router from '@/router';

const props = defineProps<{ isRegister?: boolean }>();

const { t } = useI18n();

const email = ref('');
const password = ref('');
const isPassword = ref(true);
const captchaPayload = ref('');
const updateKey = ref(0);

const loading = ref(false);
const loginError = ref(false);

const utilsStore = useUtilsStore();
const { isEnabledCaptcha } = storeToRefs(utilsStore);

const login = async () => {
  loginError.value = false;
  loading.value = true;

  try {
    if (props.isRegister) {
      await AuthService.registerViaEmail(email.value, captchaPayload.value);
    } else {
      await AuthService.login(
        email.value,
        password.value,
        captchaPayload.value,
      );
    }
    await router.push('/');
  } catch (e) {
    loginError.value = true;
  } finally {
    loading.value = false;
    updateKey.value += 1;
  }
};

const showRestoreDialog = ref(false);

const restorePassword = () => {
  showRestoreDialog.value = true;
};
</script>
