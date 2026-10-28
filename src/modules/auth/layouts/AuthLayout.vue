<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <div class="flex-1 flex justify-center items-center">
        <v-card variant="flat" color="background" class="auth-card">
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

          <div
            class="text-center font-medium text-2xl text-header-icon my-2"
          >
            <slot name="title">{{ t('auth.layout.title') }}</slot>
          </div>

          <slot name="default" />
          <slot name="actions" />
        </v-card>
      </div>

      <div class="auth-footer-info">
        <i18n-t keypath="auth.footer.contact" tag="div">
          <template #telegram>
            <a
              href="https://t.me/aiplan_faq"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary"
            >
              {{ t('auth.footer.telegram') }}
            </a>
          </template>
          <template #mail>
            <a href="mailto:aiplan@plan.aisa.ru" class="text-primary">
              {{ t('auth.footer.mail') }}
            </a>
          </template>
        </i18n-t>
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
import { onBeforeMount, onUnmounted, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import logo from '@/assets/logo.svg';
import { useUserStore } from '@/stores/user-store';
import { useUtilsStore } from '@/stores/utils-store';
import AiplanVersion from '@/components/AiplanVersion.vue';

const { t } = useI18n();

const router = useRouter();
const userStore = useUserStore();
const utilsStore = useUtilsStore();

const sessionPollInterval = ref<ReturnType<typeof setInterval> | null>(null);

const checkSession = async () => {
  try {
    await userStore.getUserInfo();

    const path = router.currentRoute.value.path;
    if (path === '/signin' || path === '/signup' || path === '/') {
      const nextUrl = localStorage.getItem('next_url');
      const url =
        typeof nextUrl === 'string' && nextUrl.startsWith('/onboarding')
          ? '/'
          : (nextUrl ?? '/');
      router.replace(url as string);
    }
  } catch (e) {
    // TODO: добавить обработку ошибок, не оставлять пустой catch
  }
};

const startSessionPolling = () => {
  if (sessionPollInterval.value) {
    clearInterval(sessionPollInterval.value);
  }
  checkSession();

  sessionPollInterval.value = setInterval(() => {
    checkSession();
  }, 10000);
};

const stopSessionPolling = () => {
  if (sessionPollInterval.value) {
    clearInterval(sessionPollInterval.value);
    sessionPollInterval.value = null;
  }
};

onMounted(() => {
  startSessionPolling();
});

onBeforeMount(() => {
  utilsStore.getVersion();
});

onUnmounted(() => {
  stopSessionPolling();
});
</script>
