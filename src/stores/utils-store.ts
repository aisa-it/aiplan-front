import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AppService } from '@/services/app.service';
import { isCurrentDateInMonthRange } from '@/utils/time';

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
      const data = await AppService.getVersion();
      isDemo.value = data.demo;
      isSingUp.value = data.sign_up;
      version.value = data.version;
      ny.value = data.ny;
      wd.value = isCurrentDateInMonthRange(3, 5, 9);
      isEnabledJitsi.value = data.jitsi;
      isEnabledCaptcha.value = data.captcha;

      if (
        ny.value === true &&
        !localStorage.getItem('snow')?.includes('disable')
      ) {
        localStorage.setItem('snow', 'enable');
      }

      return data;
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
