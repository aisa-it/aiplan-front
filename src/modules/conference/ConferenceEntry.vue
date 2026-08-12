<template>
  <div
    id="vanta-clouds-bg"
    class="w-screen h-screen relative overflow-hidden flex flex-col items-center justify-center"
  >
    <div class="absolute right-0 bottom-0 m-[0px_12px_12px_0px] text-white rounded-2xl p-1">
      <v-btn
        icon
        variant="outlined"
        size="small"
        :class="isNight ? 'border-[#5e5e5e]' : 'border-[#dbdbdb]'"
        @click="toggleClouds()"
      >
        <CloudsEnable
          v-if="!isEnableClouds"
          :color="isNight ? '#BAC4D5' : '#474A52'"
        />
        <CloudsDisable v-else :color="isNight ? '#BAC4D5' : '#474A52'" />
        <v-tooltip activator="parent" location="top start">
          {{ isEnableClouds ? 'Выключить анимацию' : 'Включить анимацию' }}
        </v-tooltip>
      </v-btn>
    </div>

    <v-btn
      v-show="!loading"
      variant="flat"
      height="40"
      width="40"
      min-width="40"
      class="absolute right-0 top-0 m-[12px_12px_0px_0px] z-[999] hover:opacity-100 px-0 min-w-0"
      color="error"
      @click="routeToWorkspace()"
    >
      <v-icon>mdi-exit-to-app</v-icon>
      <v-tooltip activator="parent" location="bottom left">
        В АИПлан
      </v-tooltip>
    </v-btn>

    <ConferenceEntryCard :loading="loading" :is-night="isNight" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

// stores
import { useUserStore } from '@/stores/user-store';
import { storeToRefs } from 'pinia';

// components
import ConferenceEntryCard from './components/ConferenceEntryCard.vue';
import CloudsEnable from '@/components/icons/CloudsEnable.vue';
import CloudsDisable from '@/components/icons/CloudsDisable.vue';

// utils
import { CLOUD_THEMES } from './constants/themes';
import { defineBackgroundImage } from './utils/defineBackgroundImage';
import { getCurrentTimeOfDay } from './utils/timeOfDay';

const router = useRouter();
const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { mobile } = useDisplay();

const loading = ref(true);
const isEnableGPU = ref(false);
const isEnableClouds = ref(true);

let vantaEffect: any = null;

onMounted(async () => {
  await userStore.getUserInfo();
  try {
    if (!mobile.value && localStorage.getItem('clouds-enable') !== '0') {
      await createClouds();
    } else {
      isEnableClouds.value = false;
      setStaticBg();
    }

    setTimeout(() => {
      loading.value = false;
    }, 700);
  } catch {
    isEnableClouds.value = false;
    setStaticBg();
    setTimeout(() => {
      loading.value = false;
    }, 700);
  }
});

async function createClouds() {
  try {
    // @ts-ignore
    const adapter = await navigator.gpu?.requestAdapter().catch(() => null);
    isEnableGPU.value = !!adapter || isWebGLSupported();

    // @ts-ignore
    const THREE = await import('three');
    // @ts-ignore
    window.THREE = THREE;

    // @ts-ignore
    const CLOUDS = await import('vanta/dist/vanta.clouds.min');

    if (isEnableGPU.value) {
      const timeOfDay = getCurrentTimeOfDay()
        .timeOfDay as keyof typeof CLOUD_THEMES;
      const theme = CLOUD_THEMES[timeOfDay] || CLOUD_THEMES.afternoon;

      let VantaClouds = CLOUDS.default;
      if (typeof VantaClouds !== 'function') {
        VantaClouds =
          // @ts-ignore
          window.VANTA?.CLOUDS || window.VANTA?.clouds || CLOUDS;
      }

      vantaEffect = VantaClouds({
        ...theme,
        // @ts-ignore
        THREE: window.THREE,
      });
    } else {
      setStaticBg();
    }
  } catch (err) {
    console.error('[ConferenceEntry] Failed to init Vanta clouds:', err);
    setStaticBg();
  }
}

function toggleClouds() {
  try {
    isEnableClouds.value = !isEnableClouds.value;

    localStorage.setItem('clouds-enable', isEnableClouds.value ? '1' : '0');

    if (isEnableClouds.value === true) {
      createClouds();
    } else if (vantaEffect) {
      vantaEffect.destroy();
      vantaEffect = null;
      setStaticBg();
    }
  } catch {
    setStaticBg();
    isEnableClouds.value = false;
  }
}

onUnmounted(() => {
  loading.value = true;

  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }
});

function isWebGLSupported() {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  return !!(gl && gl instanceof WebGLRenderingContext);
}

function setStaticBg() {
  const block = document.getElementById('vanta-clouds-bg');
  if (block) {
    block.style.backgroundImage = `url(${defineBackgroundImage(getCurrentTimeOfDay().timeOfDay)})`;
    block.style.backgroundSize = 'cover';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
  }
}

const routeToWorkspace = () => {
  if (!user.value) {
    return;
  }
  router.push(`/${user.value?.last_workspace_slug || ''}`);
};

const isNight = computed(() => {
  return getCurrentTimeOfDay().timeOfDay === 'night';
});
</script>
