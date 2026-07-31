<template>
  <div
    class="min-h-screen bg-[url('@/assets/login-bg.svg')] bg-cover bg-center bg-no-repeat flex items-center min-w-[280px] justify-start max-[1000px]:justify-center"
  >
    <div
      class="flex flex-col justify-between h-screen w-[40vw] max-[1000px]:w-[60vw] max-[1000px]:h-auto"
    >
      <div class="flex-1 flex justify-center items-center">
        <v-card
          variant="flat"
          color="background"
          class="flex flex-col content-center rounded-2xl shadow-none self-center min-w-[280px] w-[80%] px-8 py-4 z-10 max-[1000px]:w-[60vw] max-[1000px]:p-4 max-[1000px]:shadow-[0px_1px_3px_0px_#0a0d241f,0px_1px_1px_0px_#0a0d2424,0px_2px_1px_-1px_#0a0d2433,0px_0px_1px_0px_#0a0d2433]"
        >
          <v-card-title class="w-full text-center">
            <v-img
              class="w-[160px] mx-auto"
              :src="logo"
              width="150"
              contain
              inline
            >
            </v-img>
          </v-card-title>

          <v-card-subtitle
            class="text-center font-medium text-2xl text-header-icon my-2 opacity-100"
          >
            <slot name="title">Авторизация</slot>
          </v-card-subtitle>

          <slot name="default" />
          <slot name="actions" />
        </v-card>
      </div>

      <div
        class="bg-[rgb(var(--v-theme-background))] rounded-lg self-center p-2 z-10 min-w-[280px] text-sm max-[1000px]:mt-8 max-[1000px]:!w-[60vw] max-[1000px]:flex max-[1000px]:justify-center max-[1000px]:shadow-[0px_1px_3px_0px_#0a0d241f,0px_1px_1px_0px_#0a0d2424,0px_2px_1px_-1px_#0a0d2433,0px_0px_1px_0px_#0a0d2433]"
      >
        <div>
          Написать нам в
          <a
            href="https://t.me/aiplan_faq"
            target="_blank"
            class="text-primary"
          >
            телеграм
          </a>
          или на
          <a href="mailto:aiplan@plan.aisa.ru" class="text-primary"> почту</a>
        </div>
      </div>
    </div>

    <div
      class="absolute left-0 bottom-0 py-2 pl-4 flex justify-center items-center"
    >
      <AiplanVersion />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onUnmounted, onMounted } from 'vue';
import logo from '@/assets/logo.svg';
import { useAuthStore } from '../stores/auth-store';
import { useUtilsStore } from '@/stores/utils-store';
import AiplanVersion from '@/components/AiplanVersion.vue';

const authStore = useAuthStore();
const utilsStore = useUtilsStore();

onMounted(() => {
  authStore.startSessionPolling();
});

onBeforeMount(() => {
  utilsStore.getVersion();
});

onUnmounted(() => {
  authStore.stopSessionPolling();
});
</script>
