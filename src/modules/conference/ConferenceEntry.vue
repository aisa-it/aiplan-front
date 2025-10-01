<template>
  <div id="vanta-clouds-bg" class="vanta-container">
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

const router = useRouter();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const loading = ref(true);
const isEnableGPU = ref(false);

onBeforeMount(() => {
  useGlobalLoading();
});

let vantaEffect = null;

onMounted(async () => {
  await userStore.getUserInfo();
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
    const block = document.getElementById('vanta-clouds-bg');
    block.style.backgroundImage = `url(${defineBackgroundImage(getCurrentTimeOfDay().timeOfDay)})`;
    block.style.backgroundSize = 'cover';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
  }

  setTimeout(() => {
    stopGlobalLoading();
    loading.value = false;
  }, 700);
});

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

const routeToWorkspace = () => {
  router.push(`/${user.value.last_workspace_slug || '/'}`);
};

const isNight = computed(() => {
  return getCurrentTimeOfDay().timeOfDay === 'night';
});
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
