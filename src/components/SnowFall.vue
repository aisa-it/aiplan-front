<template>
  <div class="snow">
    <span
      v-for="flake in flakes"
      :key="flake.id"
      class="snow-flake"
      aria-hidden="true"
      :style="{
        '--start-x': `${flake.startX}vw`,
        '--drift': `${flake.drift}vw`,
        '--duration': `${flake.duration}s`,
        '--delay': `${flake.delay}s`,
        '--size': `${flake.size}px`,
      }"
    >
      &bull;
    </span>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useDesignSettings } from 'src/modules/profile-settings/composables/design-profile-settings/useDesignSettings';

const { setSnowDensity } = useDesignSettings();

const flakeCount = ref(170);
const flakes = ref([]);
const globalWind = ref(0);

const rnd = (min, max) =>
  Number((Math.random() * (max - min) + min).toFixed(1));

const applyWind = (wind) =>
  flakes.value.map((flake) => ({
    ...flake,
    drift: wind + rnd(-6, 6),
    duration: rnd(18, 32),
  }));

const reseedFlakes = () => {
  globalWind.value = rnd(-35, 35);
  flakes.value = Array.from({ length: flakeCount.value }).map((_, id) => ({
    id,
    size: rnd(10, 20),
    startX: rnd(0, 100),
    drift: globalWind.value + rnd(-6, 6),
    duration: rnd(18, 32),
    delay: rnd(-16, 0),
  }));
};

onMounted(() => {
  const storedDensity = Number(localStorage.getItem('snowDensity'));
  if (!storedDensity) setSnowDensity(170);
  flakeCount.value = storedDensity
  reseedFlakes();
});
</script>

<style scoped>
.snow {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000000;
}

.snow-flake {
  position: absolute;
  top: -10vh;
  left: 0;
  color: #bac4d5;
  font-family: arial, verdana, sans-serif;
  font-weight: normal;
  font-size: var(--size);
  width: var(--size);
  height: var(--size);
  line-height: var(--size);
  text-align: center;
  animation: fall var(--duration) linear infinite;
  animation-delay: var(--delay);
  transform: translate3d(var(--start-x), 0, 0);
  will-change: transform;
}

@keyframes fall {
  from {
    transform: translate3d(var(--start-x), -10vh, 0);
  }
  to {
    transform: translate3d(calc(var(--start-x) + var(--drift)), 110vh, 0);
  }
}
</style>
