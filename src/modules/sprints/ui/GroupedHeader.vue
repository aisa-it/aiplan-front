<template>
  <div class="grouped-header-wrapper">
    <q-badge
      :label="sprintsCount"
      :style="`
        background-color:${badgeColor ?? defaultColor};
        color: ${textColor}; `"
      class="q-mx-xs circle-badge"
      :class="(badgeName && !badgeColor) ? 'none-avatar' : ''"
    />

    <div class="word-wrap px-sm" style="width: 95%">
      <span class="text-bold">{{ badgeName ? badgeName : 'Без папки' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    badgeName?: string;
    badgeColor?: string;
    sprintsCount: number;
  }>();

const defaultColor = '#bac4d5';

function getContrastYIQ(r: number, g: number, b: number) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#474a52' : '#fff';
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

const textColor = computed(() => {
  let rgb = hexToRgb(props.badgeColor ?? defaultColor);
  return getContrastYIQ(rgb[0], rgb[1], rgb[2]);
});

</script>

<style scoped lang="scss">
.grouped-header-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
}
</style>
