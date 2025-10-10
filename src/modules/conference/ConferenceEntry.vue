<template>
  <div id="vanta-clouds-bg" class="vanta-container">
    <div
      v-if="isMobile === false"
      style="
        position: absolute;
        right: 0;
        bottom: 0;
        margin: 0px 12px 12px 0px;
        color: #fff;
        border-radius: 16px;
        padding: 4px;
      "
    >
      <q-btn
        v-model="isEnableClouds"
        :class="
          isNight ? 'dark-btn-only-icon-sm bordered' : 'grey-btn-only-icon-sm'
        "
        @click="toggleClouds()"
      >
        <CloudsEnable
          v-if="!isEnableClouds"
          :color="isNight === true ? '#BAC4D5' : '#474A52'"
        />
        <CloudsDisable
          v-else
          :color="isNight === true ? '#BAC4D5' : '#474A52'"
        />
        <q-tooltip anchor="top start" self="bottom right">{{
          isEnableClouds ? 'Выключить анимацию' : 'Включить анимацию'
        }}</q-tooltip></q-btn
      >
    </div>
    <q-btn
      v-show="!loading"
      style="
        position: absolute;
        right: 0;
        top: 0;
        margin: 12px 12px 0px 0px;
        color: #fff;
      "
      icon="exit_to_app"
      class="delete-btn-only-icon-sm"
      @click="() => routeToWorkspace()"
    >
      <q-tooltip anchor="bottom left"> В АИПлан </q-tooltip>
    </q-btn>

    <ConferenceEntryCard :loading="loading" :isNight="isNight" />
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, onUnmounted, ref, computed } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import {
  useGlobalLoading,
  stopGlobalLoading,
} from 'src/composables/useGlobalLoader';
import { useRouter } from 'vue-router';

import ConferenceEntryCard from './ui/ConferenceEntryCard.vue';
import { CLOUD_THEMES } from './constants/themes';
import { defineBackgroundImage } from './utils/defineBackgroundImage';

import * as THREE from 'three';
import CLOUDS from 'vanta/dist/vanta.clouds.min';
import { useQuasar } from 'quasar';
import CloudsEnable from 'src/components/icons/CloudsEnable.vue';
import CloudsDisable from 'src/components/icons/CloudsDisable.vue';

const router = useRouter();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const loading = ref(true);
const isEnableGPU = ref(false);
const isEnableClouds = ref(true);
const q = useQuasar();

onBeforeMount(() => {
  useGlobalLoading();
});

let vantaEffect = null;

onMounted(async () => {

  if (
    q.platform.is.mobile === false &&
    localStorage.getItem('clouds-enable') != '0'
  ) {
    await createClouds();
  } else {
    isEnableClouds.value = false;
    setStaticBg();
  }

  setTimeout(() => {
    stopGlobalLoading();
    loading.value = false;
  }, 700);
});

async function createClouds() {
  const gpu = await navigator?.gpu;

  if (gpu) {
    const adapter = await gpu?.requestAdapter();
    isEnableGPU.value = Boolean(adapter);
  } else {
    isEnableGPU.value = isWebGLSupported();
  }

  if (isEnableGPU.value) {
    vantaEffect = CLOUDS({
      el: '#vanta-clouds-bg',
      THREE,
      ...CLOUD_THEMES[getCurrentTimeOfDay().timeOfDay],
    });
  } else {
    setStaticBg();
  }
}

function toggleClouds() {
  isEnableClouds.value = !isEnableClouds.value;

  localStorage.setItem('clouds-enable', isEnableClouds.value ? '1' : '0');

  if (isEnableClouds.value === true) {
    createClouds();
  } else if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;

    setStaticBg();
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

  if (gl && gl instanceof WebGLRenderingContext) {
    return true;
  } else {
    return false;
  }
}

function getCurrentTimeOfDay() {
  const now = new Date();
  const hours = now.getHours();

  let timeOfDay;
  if (hours >= 5 && hours < 12) {
    timeOfDay = 'morning';
  } else if (hours >= 12 && hours < 17) {
    timeOfDay = 'afternoon';
  } else if (hours >= 17 && hours < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  return {
    time: now.toLocaleTimeString(),
    timeOfDay: timeOfDay,
  };
}

function setStaticBg() {
  const block = document.getElementById('vanta-clouds-bg');
  block.style.backgroundImage = `url(${defineBackgroundImage(getCurrentTimeOfDay().timeOfDay)})`;
  block.style.backgroundSize = 'cover';
  block.style.backgroundRepeat = 'no-repeat';
  block.style.backgroundPosition = 'center';
}

const routeToWorkspace = () => {
  router.push(`/${user.value.last_workspace_slug || '/'}`);
};

const isNight = computed(() => {
  return getCurrentTimeOfDay().timeOfDay === 'night';
});

const isMobile = computed(() => q.platform.is.mobile);
</script>
<style scoped lang="scss">
.vanta-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
