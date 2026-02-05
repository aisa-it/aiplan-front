<template>
  <div class="grouped-header-wrapper">
    <q-badge
      :label="issuesCount"
      :style="`
        background-color:${badgeColor};
        color: ${textColor}; `"
      class="q-mx-xs circle-badge"
    />

    <AvatarImage
      v-if="isMembers && entity"
      :key="entity?.name"
      :tooltip="aiplan.UserName(entity).join(' ')"
      :text="
        [
          aiplan.UserName(entity)[0].at(0),
          aiplan.UserName(entity)[1]?.at(0),
        ].join(' ')
      "
      :image="entity?.avatar_id"
      :size="'26px'"
      :btnsize="'10px'"
      :member="entity"
    />
    <div class="word-wrap px-sm" style="width: 95%">
      <span class="text-bold">{{ badgeName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import AvatarImage from 'src/components/AvatarImage.vue';
import { computed, ref, watch } from 'vue';
import aiplan from 'src/utils/aiplan';

const props = withDefaults(
  defineProps<{
    groupBy: string;
    badgeColor: string;
    issuesCount: number;
    badgeName: string;
    entity: any;
  }>(),
  {
    badgeColor: () => '#bac4d5',
  },
);
const textColor = ref();

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

const isMembers = computed(() => {
  return ['author', 'assignees', 'watchers'].includes(props.groupBy);
});

watch(
  () => props.badgeColor,
  () => {
    let rgb = hexToRgb(props.badgeColor);
    textColor.value = getContrastYIQ(rgb[0], rgb[1], rgb[2]);
  },
  { immediate: true },
);
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
