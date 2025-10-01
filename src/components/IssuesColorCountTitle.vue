<template>
  <div class="row no-wrap col full-w items-center q-pa-sm">
    <q-badge
      :label="count"
      :style="`
        background-color:${color};
        color: ${textColor}; `"
      class="q-mx-xs"
      :class="badgeClass"
    />
    <div v-if="name !== undefined && name !== ''" style="">
      <span
        class="col-2 q-table-sub-title word-wrap flex items-center"
        v-if="name !== ''"
      >
        <PrioritySingleIcon
          v-if="priority"
          :type="priority"
          :height="20"
          :width="20"
        />
        <span class="q-ml-xs"> {{ name }}</span>
      </span>
    </div>
    <div v-else style="text-align: left">
      <div class="col-2 q-table-sub-title word-wrap">
        {{ placeholder }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import PrioritySingleIcon from './icons/PrioritySingleIcon.vue';
import { watch, ref } from 'vue';

const props = defineProps({
  name: { type: String, required: false },
  count: { type: Number, required: false },
  placeholder: { type: String, required: false },
  priority: { type: String, required: false },
  color: {
    type: String,
    required: false,
    default: () => '#bac4d5',
  },
  badgeClass: {
    type: String,
    required: false,
    default: () => 'circle-badge',
  },
});

const textColor = ref('');

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getContrastYIQ(r, g, b) {
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#474a52' : '#fff';
}

watch(
  () => props.color,
  () => {
    let rgb = hexToRgb(props.color);
    textColor.value = getContrastYIQ(rgb[0], rgb[1], rgb[2]);
  },
  { immediate: true },
);
</script>
