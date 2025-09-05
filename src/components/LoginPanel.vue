<template>
  <div class="fullscreen login-wrapper">
    <q-img src="~assets/login-bg.svg" alt="login-hero" class="login-bg" />

    <div class="login-wrap">
      <div class="center-wrapper">
        <div class="flex column login-card justify-center">
          <div class="w-full text-center">
            <q-img
              class="login-panel__logo"
              src="~assets/logo.svg"
              style="width: 150px; overflow: visible"
            >
              <HatXmasIcon
                v-if="ny"
                class="hat-overlay"
                :width="50"
                :height="50"
              />
            </q-img>
          </div>

          <h5 style="text-align: center; flex: 0; margin: 8px 0px">
            {{ isRegister ? 'Регистрация' : 'Авторизация' }}
          </h5>
          <q-form
            @submit="login"
            v-if="!isRegister"
            class="flex column justify-center"
          >
            <q-input
              class="base-input"
              dense
              v-model="email"
              label="Введите email"
              data-id="email"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Необходимо ввести email',
                (val) => isEmail(val),
              ]"
              :error-message="
                registerError ? 'Некорректные данные авторизации' : undefined
              "
              :error="registerError"
              @update:model-value="registerError = false"
              :disable="loading"
            />
            <q-input
              class="base-input"
              dense
              v-model="password"
              label="Введите пароль"
              data-id="password"
              lazy-rules
              :type="isPassword ? 'password' : 'text'"
              :rules="[
                (val) => (val && val.length > 0) || 'Необходимо ввести пароль',
              ]"
              :error-message="
                registerError ? 'Некорректные данные авторизации' : undefined
              "
              :error="registerError"
              :disable="loading"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPassword = !isPassword"
                />
              </template>
            </q-input>
            <CaptchaWidget
              @verified="(payload) => (captchaPayload = payload)"
              :key="updateKey"
            />
            <q-btn
              class="login-panel__forget-btn"
              flat
              no-caps
              @click="restorePassword()"
              >Забыли свой пароль?</q-btn
            >
            <q-btn
              class="primary-btn full-w"
              no-caps
              type="submit"
              id="login"
              :loading="loading"
              :disable="captchaPayload == ''"
              >Войти</q-btn
            >
          </q-form>
          <RegisterPanel
            v-else
            @registerRequestSent="isRegister = !isRegister"
          />

          <q-btn
            v-if="isSingUp"
            dense
            flat
            no-caps
            color="primary"
            class="q-mt-sm"
            @click="() => $router.push('/signup')"
          >
            {{
              isRegister
                ? 'Уже есть аккаунт? Войдите'
                : 'Нет аккаунта? Зарегистрируйтесь'
            }}
          </q-btn>
        </div>
      </div>
      <div class="help-footer">
        <div>
          Напиcать нам в
          <a href="https://t.me/aiplan_faq" target="_blank" class="primary-link"
            >телеграм
          </a>
          или на
          <a href="mailto:aiplan@plan.aisa.ru" class="primary-link"> почту</a>
        </div>
      </div>
    </div>
    <div
      style="position: absolute; left: 0; bottom: 0; padding: 8px 0px 8px 16px"
      class="centered-horisontally justify-center"
    >
      <AiplanVersion />
    </div>
    <NotificationAlert />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useQuasar, useMeta } from 'quasar';
import { ref, onBeforeMount, onUnmounted, onMounted } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useLoaderStore } from 'src/stores/loader-store';

// utils
import { isEmail } from 'src/utils/validation';

// components
import AiplanVersion from 'src/components/AiplanVersion.vue';
import RegisterPanel from 'src/components/RegisterPanel.vue';
import PasswordRestoreDialog from './PasswordRestoreDialog.vue';
import NotificationAlert from 'src/components/notifications/NotificationAlert.vue';
import CaptchaWidget from 'src/components/CaptchaWidget.vue';
import HatXmasIcon from './icons/HatXmasIcon.vue';
import {
  stopGlobalLoading,
  useGlobalLoading,
} from 'src/composables/useGlobalLoader';
import { useLoad } from 'src/composables/useLoad';

const $q = useQuasar();
const api = useAiplanStore();
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const loaderStore = useLoaderStore();

const router = useRouter();
const { isSingUp } = storeToRefs(utilsStore);
const { ny } = storeToRefs(utilsStore);
const email = ref('');
const password = ref('');
const isPassword = ref(true);
const isRegister = ref(false);
const captchaPayload = ref('');
const refreshInterval = ref();
const registerError = ref(false);
const updateKey = ref(0);

const { loading, onLoad } = useLoad(api.login);

const tryToAuth = async () => {
  userStore.getUserInfo().then(async () => {
    router.push('/');
  });
};

const intervalRefresh = () => {
  clearInterval(refreshInterval.value);
  refreshInterval.value = setInterval(() => tryToAuth(), 10000);
};

intervalRefresh();
onMounted(() => {
  tryToAuth();
  stopGlobalLoading();
});
useMeta({
  title: 'АИПлан | Инструмент управления проектами.',
});

onBeforeMount(() => {
  utilsStore.getVersion();
  $q.dark.set(false);
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

const restorePassword = () => {
  $q.dialog({
    component: PasswordRestoreDialog,
  }).onOk(() => {
    console.log('res');
  });
};
const login = async () => {
  registerError.value = false;
  const res = await onLoad(email.value, password.value, captchaPayload.value);

  if (res.response?.status === 200) {
    useGlobalLoading();
  }
  if (res !== true) {
    registerError.value = true;
  }

  updateKey.value += 1;
};
</script>
<style lang="scss" scoped>
.login-bg {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 0;
  height: 100vh !important;
  width: 100vw !important;
  object-fit: cover;
}

.login-panel__logo {
  width: 160px !important;
}

.login-wrapper {
  display: flex;
  justify-content: left;
  align-items: center;
  min-width: 280px;
}

.hat-overlay {
  position: absolute;
  top: -60%;
  right: 49.5%;
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10;
  filter: drop-shadow(-3px -1px 4px rgba(0, 0, 0, 0.7));
}

@media screen and (max-width: 1000px) {
  .login-wrapper {
    justify-content: center;
  }
  .login-card {
    width: 60vw;
    padding: 16px;
    box-shadow:
      0px 1px 3px 0px #0a0d241f,
      0px 1px 1px 0px #0a0d2424,
      0px 2px 1px -1px #0a0d2433,
      0px 0px 1px 0px #0a0d2433;
  }
  .help-footer {
    box-shadow:
      0px 1px 3px 0px #0a0d241f,
      0px 1px 1px 0px #0a0d2424,
      0px 2px 1px -1px #0a0d2433,
      0px 0px 1px 0px #0a0d2433;
  }
}
</style>
