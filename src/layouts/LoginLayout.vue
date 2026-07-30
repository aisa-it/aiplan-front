<template>
  <div class="h-screen login-wrapper min-h-screen bg-[url('@/assets/login-bg.svg')]  bg-cover bg-center bg-no-repeat">

    <div class="login-wrap">
      <div class="center-wrapper">
        <v-card
          variant="flat"
          color="background"
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
            </v-img>
          </v-card-title>

          <v-card-subtitle class="text-center font-medium text-2xl text-header-icon" style="margin: 8px 0px" opacity="1">
              <slot name="title">Авторизация</slot>
          </v-card-subtitle>

          <slot name="default" />
          <slot name="actions" />

        </v-card>
      </div>

      <div class="help-footer text-base text-sm bg-theme-background">
        <div>
          Написать нам в
          <a href="https://t.me/aiplan_faq" target="_blank" class="text-primary">
            телеграм
          </a>
          или на
          <a href="mailto:aiplan@plan.aisa.ru" class="text-primary"> почту</a>
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
import { ref, onBeforeMount, onUnmounted, onMounted } from 'vue';
import logo from '@/assets/logo.svg';
const refreshInterval = ref();
const registerError = ref(false);
const updateKey = ref(0);

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


onBeforeMount(() => {
  // TODO
  // utilsStore.getVersion();
  // $q.dark.set(false); // Удаляем Quasar
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});

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

.help-footer {
  background-color: rgb(var(--v-theme-background));
  border-radius: 8px;
  align-self: center;
  padding: 8px 8px;
  z-index: 1;
  min-width: 280px;
}

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
    margin-top: 32px;
    width: 60vw !important;
    display: flex;
    justify-content: center;
    box-shadow:
      0px 1px 3px 0px #0a0d241f,
      0px 1px 1px 0px #0a0d2424,
      0px 2px 1px -1px #0a0d2433,
      0px 0px 1px 0px #0a0d2433;
  }
}
</style>
