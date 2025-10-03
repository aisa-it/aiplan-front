<template>
  <div align="center" style="margin: 0 auto" class="login-container">
    <div class="w-full text-center">
      <q-img
        class="login-panel__logo"
        src="~assets/logo.svg"
        style="width: 190px; overflow: visible"
      >
        <HatXmasIcon v-if="ny" class="hat-overlay" :width="50" :height="50" />
      </q-img>
    </div>
    <div class="text-h6 q-my-md">
      Для записи ответа необходимо пройти авторизацию
    </div>
    <q-form @submit="login" class="flex column justify-center">
      <q-input
        class="base-input"
        dense
        v-model="email"
        label="Введите email"
        id="email"
        lazy-rules
        :rules="[
          (val) => (val && val.length > 0) || 'Необходимо ввести email',
          (val) => isEmail(val),
        ]"
      />
      <q-input
        class="base-input"
        dense
        v-model="password"
        label="Введите пароль"
        id="password"
        lazy-rules
        :type="isPassword ? 'password' : 'text'"
        :rules="[
          (val) => (val && val.length > 0) || 'Необходимо ввести пароль',
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPassword = !isPassword"
          />
        </template>
      </q-input>
      <div class="flex justify-start">
        <CaptchaWidget
          v-if="isEnabledCaptcha"
          @verified="(payload) => (captchaPayload = payload)"
          :key="updateKey"
        />
      </div>
      <q-btn
        flat
        no-caps
        class="btn full-w q-mt-md text-weight-bold"
        color="primary"
        @click="restorePassword()"
        >Забыли свой пароль?</q-btn
      >
      <q-btn
        class="primary-btn full-w q-mt-md"
        no-caps
        type="submit"
        id="login"
        :disable="isEnabledCaptcha ? captchaPayload == '' : false"
        >Войти</q-btn
      >
    </q-form>
    <NotificationAlert />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CaptchaWidget from 'src/components/CaptchaWidget.vue';
import PasswordRestoreDialog from './PasswordRestoreDialog.vue';
import NotificationAlert from 'src/components/notifications/NotificationAlert.vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useLoaderStore } from 'src/stores/loader-store';
import { isEmail } from 'src/utils/validation';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';

const api = useAiplanStore();
const loaderStore = useLoaderStore();
const quasar = useQuasar();

const password = ref('');
const email = ref('');
const isPassword = ref(true);
const captchaPayload = ref('');
const updateKey = ref(0);
const { isEnabledCaptcha } = storeToRefs(useUtilsStore());
const login = async () => {
  loaderStore.startLoading();
  await api.login(email.value, password.value, captchaPayload.value);
  loaderStore.stopLoading();
  location.reload();
};

const restorePassword = () => {
  quasar
    .dialog({
      component: PasswordRestoreDialog,
    })
    .onOk(() => {
      console.log('res');
    });
};
</script>
