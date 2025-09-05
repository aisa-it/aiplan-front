<template>
  <div class="fullscreen login-wrapper">
    <div class="login-wrap">
      <div class="center-wrapper">
        <q-img src="~assets/login-bg.svg" alt="login-hero" class="login-bg" />
        <div class="flex column login-card justify-center">
          <div class="w-full text-center">
            <q-img
              class="login-panel__logo"
              src="~assets/logo.svg"
              style="width: 150px"
            />
          </div>

          <h5 style="text-align: center; flex: 0; margin: 8px 0px">
            Регистрация
          </h5>

          <RegisterPanel @registerRequestSent="() => $router.push('/signin')" />

          <q-btn
            v-if="isSingUp"
            dense
            flat
            no-caps
            color="primary"
            class="q-mt-sm"
            @click="() => $router.push('/signin')"
          >
            Уже есть аккаунт? Войдите
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

  </div>
</template>

<script lang="ts">
// core
import { storeToRefs } from 'pinia';
import { defineComponent, onMounted } from 'vue';

// stores
import { useUtilsStore } from 'src/stores/utils-store';

// components
import AiplanVersion from 'src/components/AiplanVersion.vue';
import RegisterPanel from 'src/components/RegisterPanel.vue';

export default defineComponent({
  name: 'LoginPanel',
  components: {
    AiplanVersion,
    RegisterPanel,
  },
  setup() {
    const utilsStore = useUtilsStore();
    const { isSingUp } = storeToRefs(utilsStore);

    onMounted(async () => await utilsStore.getVersion());

    return {
      isSingUp,
    };
  },
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
