<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="'viewBox' in icon ? icon.viewBox : '0 0 24 24'"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <template v-if="'paths' in icon">
      <path v-for="(path, index) in icon.paths" :key="index"
        :d="path.d" :fill="path.fill" :stroke="'stroke' in path ? path.stroke : undefined"
        :stroke-width="'strokeWidth' in path ? path.strokeWidth : undefined" stroke-linecap="round" stroke-linejoin="round" />
    </template>
    <path v-else
      :d="icon.path"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { EDITOR_ICONS, type EditorIconName } from '../icons/editor-icons';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: EditorIconName;
    size?: number;
  }>(),
  {
    size: 24,
  },
);
const icon = computed(() => EDITOR_ICONS[props.name]);
</script>
