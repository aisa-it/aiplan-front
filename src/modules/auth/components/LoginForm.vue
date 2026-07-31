<template>
  <v-form @submit.prevent="login" class="flex flex-col content-center">
    <v-text-field
      v-model="email"
      name="email"
      autocomplete="username"
      label="Введите email"
      data-id="email"
      :rules="[
        (val) => (val && val.length > 0) || 'Необходимо ввести email',
        (val) => isEmail(val) || 'Введите корректный email',
      ]"
      :error-messages="
        loginError ? 'Некорректные данные авторизации' : undefined
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
      label="Введите пароль"
      placeholder="Введите пароль"
      data-id="password"
      :type="isPassword ? 'password' : 'text'"
      :rules="[(val) => (val && val.length > 0) || 'Необходимо ввести пароль']"
      :error-messages="
        loginError ? 'Некорректные данные авторизации' : undefined
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
      Забыли свой пароль?
    </v-btn>

    <v-btn
      class="rounded-lg text-sm tracking-wide mt-4"
      type="submit"
      id="login"
      :loading="loading"
      :disabled="
        (isEnabledCaptcha && captchaPayload === '') ||
        (isRegister && isEmail(email) !== true)
      "
      size="large"
      block
      active-color="rgba(255, 255, 255, 0.6)"
    >
      {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
    </v-btn>

    <PasswordRestoreDialog v-model="showRestoreDialog" />
  </v-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { isEmail } from '@/utils/validation';
import CaptchaWidget from './CaptchaWidget.vue';
import PasswordRestoreDialog from './PasswordRestoreDialog.vue';
import { AuthService } from '../api/auth.service';
import { useUtilsStore } from '@/stores/utils-store';
import router from '@/router';

const props = defineProps<{ isRegister?: boolean }>();

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
