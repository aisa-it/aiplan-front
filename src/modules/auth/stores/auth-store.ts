import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { applyInterceptors } from '@/utils/interceptors';

const api = applyInterceptors(
  axios.create({ baseURL: '', withCredentials: true }),
);

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const isAuthenticated = ref(false);
  const loading = ref(false);
  const loginError = ref(false);

  const sessionPollInterval = ref<ReturnType<typeof setInterval> | null>(null);

  async function checkSession() {
    try {
      const userStore = useUserStore();
      await userStore.getUserInfo();

      isAuthenticated.value = true;

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
      isAuthenticated.value = false;
    }
  }

  function startSessionPolling() {
    if (sessionPollInterval.value) {
      clearInterval(sessionPollInterval.value);
    }
    checkSession();

    sessionPollInterval.value = setInterval(() => {
      checkSession();
    }, 10000);
  }

  function stopSessionPolling() {
    if (sessionPollInterval.value) {
      clearInterval(sessionPollInterval.value);
      sessionPollInterval.value = null;
    }
  }

  async function login(
    email: string,
    password?: string,
    captchaPayload?: string,
  ) {
    loading.value = true;
    loginError.value = false;
    try {
      const res = await api.post('/api/sign-in/', {
        email,
        password,
        medium: 'email',
        captcha_payload: captchaPayload || '',
      });

      if (res.status === 200 || res.status === 201) {
        isAuthenticated.value = true;
        await checkSession();
      }
    } catch (e) {
      loginError.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function registerViaEmail(email: string, captchaPayload?: string) {
    loading.value = true;
    loginError.value = false;
    try {
      await api.post('/api/sign-up/', {
        email,
        captcha_payload: captchaPayload || '',
      });
    } catch (e) {
      loginError.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(email: string, captchaPayload?: string) {
    loading.value = true;
    try {
      await api.post('/api/forgot-password/', {
        email,
        captcha_payload: captchaPayload || '',
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    try {
      await api.post('/api/auth/sign-out/');
      isAuthenticated.value = false;
      router.push('/signin');
    } catch (e) {
      console.error(e);
    }
  }

  async function signOutEverywhere() {
    try {
      await api.post('/api/auth/sign-out-everywhere/');
      isAuthenticated.value = false;
      router.push('/signin');
    } catch (e) {
      console.error(e);
    }
  }

  return {
    isAuthenticated,
    loading,
    loginError,
    checkSession,
    startSessionPolling,
    stopSessionPolling,
    login,
    registerViaEmail,
    forgotPassword,
    signOut,
    signOutEverywhere,
  };
});
