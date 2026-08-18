<template>
  <!-- EditorBgColorPicker and EditorTableFillButton -->
  <div
    v-if="props.isBgColor"
    class="row q-gutter-sm items-center main-box-picker"
    :class="props.classPrevent"
  >
    <div
      class="color-box cursor-pointer flex flex-center"
      style="position: relative"
      @click="emits('selectBgColor', 'inherit')"
    >
      <span class="diagonal-line"></span>
      <v-tooltip activator="parent">Отсутствует</v-tooltip>
    </div>
    <div
      v-for="color in bgColors"
      :key="color.bgColor"
      :class="[
        'color-box cursor-pointer flex flex-center',
        { selected: color.bgColor === modelValue },
      ]"
      :style="{ backgroundColor: color.bgColor }"
      @click="
        emits('selectBgColor', props.isTableCell ? color.key : color.bgColor)
      "
    >
      <span
        class="text-weight-medium picker-text-example"
        :style="{ color: color.color }"
        >A</span
      >
      <v-tooltip activator="parent">{{ color.label }}</v-tooltip>
    </div>
  </div>
  <!-- EditorColorPicker -->
  <div
    v-else
    class="row q-gutter-sm items-center main-box-picker"
    :class="props.classPrevent"
  >
    <div
      v-for="color in colors"
      :key="color.color"
      :class="[
        'color-box cursor-pointer flex flex-center',
        { selected: color.color === modelValue },
      ]"
      @click="emits('selectTextColor', color.color)"
    >
      <span
        class="text-weight-medium picker-text-example"
        :style="{ color: color.color }"
        >A</span
      >
      <v-tooltip activator="parent">{{ color.label }}</v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import { colorMap, bgColorMap } from '@/utils/editorColorMap';

const props = defineProps<{
  modelValue?: string;
  isBgColor: boolean;
  isTableCell?: boolean;
  classPrevent?: string;
}>();

const emits = defineEmits<{
  (e: 'selectBgColor', value: string): void;
  (e: 'selectTextColor', value: string): void;
}>();

const vuetifyTheme = useTheme();
const theme = vuetifyTheme.global.current.value.dark ? 'dark' : 'light';

const colors = Object.entries(colorMap).map(([, value]) => ({
  color: value[theme],
  label: value.label,
}));

const bgColors = Object.entries(bgColorMap).map(([key, value]) => ({
  bgColor: value[theme],
  color: colorMap[key as keyof typeof colorMap]?.[theme] || '#000',
  label: value.label,
  key,
}));
</script>

<style scoped>
.main-box-picker {
  max-width: 145px;
  padding: 8px;
}

.picker-text-example {
  font-size: 15px;
}

.diagonal-line {
  width: 70px;
  height: 1px;
  background: red;
  transform: rotate(45deg);
}
</style>
