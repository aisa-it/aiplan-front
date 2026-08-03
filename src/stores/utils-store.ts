import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { applyInterceptors } from '@/utils/interceptors';
import { isCurrentDateInMonthRange } from '@/utils/time';

const api = applyInterceptors(
  axios.create({ baseURL: '', withCredentials: true }),
);

export const useUtilsStore = defineStore('utils', () => {
  const version = ref('');
  const ny = ref(false);
  const isEnabledCaptcha = ref(false);
  const isDemo = ref(false);
  const isSingUp = ref(false);
  const wd = ref(false);
  const isEnabledJitsi = ref(false);

  async function getVersion() {
    try {
      const res = await api.get('/api/version/');
      isDemo.value = res.data.demo;
      isSingUp.value = res.data.sign_up;
      version.value = res.data.version;
      ny.value = res.data.ny;
      wd.value = isCurrentDateInMonthRange(3, 5, 9);
      isEnabledJitsi.value = res.data.jitsi;
      isEnabledCaptcha.value = res.data.captcha;

      if (
        ny.value === true &&
        !localStorage.getItem('snow')?.includes('disable')
      ) {
        localStorage.setItem('snow', 'enable');
      }

      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  return {
    version,
    ny,
    isEnabledCaptcha,
    isDemo,
    isSingUp,
    wd,
    isEnabledJitsi,
    getVersion,
  };
});
