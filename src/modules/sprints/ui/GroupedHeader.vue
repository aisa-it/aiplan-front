<template>
  <div class="grouped-header-wrapper" @click.right.prevent="onContextMenu">
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
    <FolderContextMenu
      v-if="folder.id !== ROOT_FOLDER_ID"
      :folder-id="folder.id"
      :folder-name="folder.name ?? ''"
      :anchor-event="contextEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DtoSprintFolder } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import FolderContextMenu from 'src/modules/sprints/sprints-table/components/FolderContextMenu.vue';
import { ROOT_FOLDER_ID } from 'src/constants/constants';

const props = defineProps<{
    badgeName?: string;
    badgeColor?: string;
    sprintsCount: number;
    folder: DtoSprintFolder;
  }>();

const defaultColor = '#bac4d5';

const contextEvent = ref<MouseEvent | null>(null);

const onContextMenu = (evt) => {
  contextEvent.value = evt;
};

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
