<template>
  <v-form
    @submit.prevent="login"
    class="flex flex-col content-center"
  >
    <v-text-field
      density="compact"
      class="text-base login-field"
      v-model="email"
      label="Введите email"
      data-id="email"
      :rules="[
        (val) => (val && val.length > 0) || 'Необходимо ввести email',
        (val) => isEmail(val) || 'Введите корректный email',
      ]"
      :error-messages="registerError ? 'Некорректные данные авторизации' : undefined"
      :error="registerError"
      @update:model-value="registerError = false"
      :disabled="loading"
      variant="underlined"
    />

    <v-text-field
      v-if="!isRegister"
      density="compact"
      class="text-base login-field"
      v-model="password"
      label="Введите пароль"
      data-id="password"
      :type="isPassword ? 'password' : 'text'"
      :rules="[
        (val) => (val && val.length > 0) || 'Необходимо ввести пароль',
      ]"
      :error-messages="registerError ? 'Некорректные данные авторизации' : undefined"
      :error="registerError"
      :disabled="loading"
      :append-inner-icon="isPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPassword = !isPassword"
    />

    <!-- <CaptchaWidget
      v-if="isEnabledCaptcha"
      :key="updateKey"
      @verified="(payload) => (captchaPayload = payload)"
    /> -->

    <v-btn
      v-if="!isRegister"
      class="text-sm text-base rounded-none"
      variant="text"
      @click="restorePassword()"
      size="large"
    >
      Забыли свой пароль?
    </v-btn>

    <v-btn class="rounded-lg text-sm tracking-wide"
      type="submit"
      id="login"
      :loading="loading"
      :disabled="
        (isEnabledCaptcha && captchaPayload === '') || (isRegister && isEmail(email) !== true)"
      size="large"
      block
      active-color="rgba(255, 255, 255, 0.6)"
    >
      {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
    </v-btn>
  </v-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { isEmail } from '@/utils/validation';
import CaptchaWidget from '@/components/CaptchaWidget.vue';

const props = defineProps<{isRegister?: boolean}>();

const email = ref('');
const password = ref('');
const isPassword = ref(true);
const isEnabledCaptcha  = ref(false);
const captchaPayload = ref('');

// TODO:
// const { ny, isEnabledCaptcha } = storeToRefs(utilsStore);

const registerError = ref(false);
const updateKey = ref(0);
// TODO
const loading = ref(false);
// const { loading, onLoad } = useLoad(api.login);

const login = async () => {
  registerError.value = false;
  // TODO
  // const res = await onLoad(email.value, password.value, captchaPayload.value);

  // if (res.response?.status === 200) {
    // useGlobalLoading();
  // }
  // if (res !== true) {
    // registerError.value = true;
  // }

  updateKey.value += 1;
};

// TODO:
const restorePassword = () => {
  // Пока просто выводим в консоль
  console.log('Restore password');
  // TODO: Добавить диалог Vuetify
};
</script>

<style scoped lang="scss">
  .login-field :deep(.v-field__input),
  .login-field :deep(.v-field-label) {
    font-size: 14px;
    line-height: 24px;
    height: 40px;
  }

</style>
