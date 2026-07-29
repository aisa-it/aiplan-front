<template>
  <div class="h-screen login-wrapper min-h-screen bg-[url('@/assets/login-bg.svg')]  bg-cover bg-center bg-no-repeat">

    <div class="login-wrap">
      <div class="center-wrapper">
        <v-card
          variant="text"
          class="flex flex-col login-card content-center rounded-none shadow-none"
        >
          <v-card-title class="w-full text-center">
            <v-img
              class="login-panel__logo"
              :src="logo"
              width="150"
              contain
              inline
            >
              <!-- <HatXmasIcon
                v-if="ny"
                class="hat-overlay"
                :width="50"
                :height="50"
              /> -->
            </v-img>
          </v-card-title>

          <v-card-subtitle class="text-center font-medium text-2xl text-secondary" style="margin: 8px 0px" opacity="1">
            {{ isRegister ? 'Регистрация' : 'Авторизация' }}
          </v-card-subtitle>

          <v-form
            v-if="!isRegister"
            @submit.prevent="login"
            class="flex flex-col content-center"
          >
            <v-text-field
              density="compact"
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
              density="compact"
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
              class="text-secondary text-sm"
              variant="text"
              @click="restorePassword()"
              size="large"
            >
              Забыли свой пароль?
            </v-btn>

            <v-btn class="bg-primary text-base rounded-lg text-sm tracking-wide"
              type="submit"
              id="login"
              :loading="loading"
              :disabled="isEnabledCaptcha ? captchaPayload == '' : false"
              size="large"
              block
              active-color="rgba(255, 255, 255, 0.6)"
            >
              Войти
            </v-btn>
          </v-form>

          <!-- Панель регистрации -->
          <!-- <RegisterPanel
            v-else
            @registerRequestSent="isRegister = !isRegister"
          /> -->

          <v-btn
            v-if="isSingUp"
            density="compact"
            variant="text"
            color="primary"
            class="text-primary text-sm"
            @click="() => $router.push('/signup')"
            size="large"
          >
            {{
              isRegister
                ? 'Уже есть аккаунт? Войдите'
                : 'Нет аккаунта? Зарегистрируйтесь'
            }}
          </v-btn>
        </v-card>
      </div>

      <div class="help-footer">
        <div>
          Написать нам в
          <a href="https://t.me/aiplan_faq" target="_blank" class="primary-link">
            телеграм
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
// import { storeToRefs } from 'pinia';
// import { useQuasar, useMeta } from 'quasar'; // Удаляем Quasar
import { ref, onBeforeMount, onUnmounted, onMounted } from 'vue';

// stores
// import { useUserStore } from '@/stores/user-store';
// import { useUtilsStore } from '@/stores/utils-store';
// import { useAiplanStore } from '@/stores/aiplan-store';

// utils
import { isEmail } from '@/utils/validation';

// components
// import AiplanVersion from '@/components/AiplanVersion.vue';
// import RegisterPanel from '@/components/RegisterPanel.vue';
// import PasswordRestoreDialog from './PasswordRestoreDialog.vue';
import CaptchaWidget from '@/components/CaptchaWidget.vue';
// import HatXmasIcon from './icons/HatXmasIcon.vue';
// import {
//   stopGlobalLoading,
//   useGlobalLoading,
// } from '@/composables/useGlobalLoader';
// import { useLoad } from '@/composables/useLoad';
import logo from '@/assets/logo.svg';

// const $q = useQuasar(); // Удаляем Quasar
// const api = useAiplanStore();
// const userStore = useUserStore();
// const utilsStore = useUtilsStore();

const router = useRouter();
// const { isSingUp } = storeToRefs(utilsStore);
const isSingUp = ref(true);
// const { ny, isEnabledCaptcha } = storeToRefs(utilsStore);
const isEnabledCaptcha  = false;
const email = ref('');
const password = ref('');
const isPassword = ref(true);
const isRegister = ref(false);
const captchaPayload = ref('');
const refreshInterval = ref();
const registerError = ref(false);
const updateKey = ref(0);

// TODO
const loading = ref(false);
// const { loading, onLoad } = useLoad(api.login);

const tryToAuth = async () => {
  // userStore.getUserInfo().then(async () => {
  //   router.push('/');
  // });
};

const intervalRefresh = () => {
  clearInterval(refreshInterval.value);
  refreshInterval.value = setInterval(() => tryToAuth(), 10000);
};

intervalRefresh();
onMounted(() => {
  tryToAuth();
  // stopGlobalLoading();
});

// useMeta заменяем на useHead или просто удаляем
// useMeta({
//   title: 'АИПлан | Инструмент управления проектами.',
// });

onBeforeMount(() => {
  // TODO
  // utilsStore.getVersion();
  // $q.dark.set(false); // Удаляем Quasar
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

// Функция восстановления пароля (нужно переделать под Vuetify)
const restorePassword = () => {
  // Пока просто выводим в консоль
  console.log('Restore password');
  // TODO: Добавить диалог Vuetify
};

const login = async () => {
  registerError.value = false;
  // const res = await onLoad(email.value, password.value, captchaPayload.value);

  // if (res.response?.status === 200) {
    // useGlobalLoading();
  // }
  // if (res !== true) {
    // registerError.value = true;
  // }

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

.login-wrap {
  height: 100vh;
  width: 40vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.center-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  align-self: center;
  min-width: 280px;
  width: 80%;
  padding: 16px 32px;
  border-radius: 16px;
  z-index: 10;
}

// .hat-overlay {
//   position: absolute;
//   top: -60%;
//   right: 49.5%;
//   background-size: contain;
//   background-repeat: no-repeat;
//   pointer-events: none;
//   z-index: 10;
//   filter: drop-shadow(-3px -1px 4px rgba(0, 0, 0, 0.7));
// }

@media screen and (max-width: 1000px) {
  .login-wrapper {
    justify-content: center;
  }

  .login-wrap {
    width: 60vw;
    height: auto;
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
