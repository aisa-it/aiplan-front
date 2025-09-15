<template>
  <!-- EditorBgColorPicker and EditorTableFillButton -->
  <div
    v-if="props.isBgColor && !props.isSpoiler"
    class="row q-gutter-sm items-center main-box-picker"
    :class="props.classPrevent"
  >
    <div
      class="color-box cursor-pointer flex flex-center"
      style="position: relative"
      @click="$emit('selectBgColor', 'inherit')"
    >
      <span class="diagonal-line"></span>
      <q-tooltip>Отсутствует</q-tooltip>
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
        $emit('selectBgColor', props.isTableCell ? color.key : color.bgColor)
      "
    >
      <span
        class="text-weight-medium picker-text-example"
        :style="{ color: color.color }"
        >A</span
      >
      <q-tooltip>{{ color.label }}</q-tooltip>
    </div>
  </div>
  <!-- EditorColorPicker -->
  <div
    v-else-if="!props.isBgColor && !props.isSpoiler"
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
      @click="$emit('selectTextColor', color.color)"
    >
      <span
        class="text-weight-medium picker-text-example"
        :style="{ color: color.color }"
        >A</span
      >
      <q-tooltip>{{ color.label }}</q-tooltip>
    </div>
  </div>
  <!-- EditorSpoilerButton -->
  <div
    v-if="props.isSpoiler"
    class="row q-gutter-sm spoiler-box-picker"
    :class="props.classPrevent"
  >
    <div class="flex">
      <div class="flex q-gutter-sm background-picker">
        <div class="q-pt-sm q-pl-sm">Цвет фона</div>
        <div class="flex q-gutter-sm">
          <div
            v-for="(color, index) in bgColors"
            :key="index"
            :class="[
              'color-box cursor-pointer flex flex-center',
              { selected: color.bgColor === selectedBgColor },
            ]"
            :style="{ background: color.bgColor }"
            @click="() => (selectedBgColor = color.bgColor)"
          >
            <q-tooltip>{{ color.label }}</q-tooltip>
          </div>
        </div>
      </div>
      <div class="flex q-gutter-sm color-text-picker">
        <div class="q-pt-sm q-pl-sm">Цвет текста</div>
        <div class="flex q-gutter-sm">
          <div
            v-for="color in colors"
            :key="color.color"
            :class="[
              'color-box cursor-pointer flex flex-center',
              { selected: color.color === selectedTextColor },
            ]"
            @click="() => (selectedTextColor = color.color)"
          >
            <span
              class="text-weight-medium picker-text-example"
              :style="{ color: color.color }"
              >A</span
            >
            <q-tooltip>{{ color.label }}</q-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex items-center justify-center"
      style="width: 100%"
      @selectstart.prevent
    >
      <div class="q-pl-sm">Прозрачность</div>
      <q-slider
        v-model="opacity"
        :min="0"
        :max="1"
        :step="0.01"
        style="width: 200px"
      />
    </div>
    <q-btn
      v-close-popup
      class="primary-btn approve-btn"
      color="primary"
      label="Применить"
      size="12px"
      @click="() => generateSpoiler()"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { colorMap, bgColorMap } from 'src/utils/editorColorMap';
import { hexWithOpacity, getOpacityFromHex } from '../utils/editorUtils';

interface IStyleSpoiler {
  bgColor: string;
  textColor: string;
}

const props = defineProps<{
  modelValue?: string;
  isBgColor: boolean;
  isSpoiler: boolean;
  isTableCell?: boolean;
  styleColors?: IStyleSpoiler;
  classPrevent?: string;
}>();

const emit = defineEmits<{
  (e: 'select', value: IStyleSpoiler): void;
  (e: 'selectBgColor', value: string): void;
  (e: 'selectTextColor', value: string): void;
}>();

const $q = useQuasar();
const theme = $q.dark.isActive ? 'dark' : 'light';

const selectedBgColor = ref<string>('');
const selectedTextColor = ref<string>('');
const opacity = ref<number>(0.2);

// Генерация цветов для текста
const colors = Object.entries(colorMap).map(([, value]) => ({
  color: value[theme],
  label: value.label,
}));

// Генерация фона
const bgColors = Object.entries(bgColorMap).map(([key, value]) => ({
  bgColor: value[theme],
  color: colorMap[key as keyof typeof colorMap]?.[theme] || '#000',
  label: value.label,
  key: value.key,
}));

const clearValues = () => {
  selectedBgColor.value = '';
  selectedTextColor.value = '';
  opacity.value = 0.2;
};

const generateSpoiler = () => {
  emit('select', {
    bgColor: hexWithOpacity(selectedBgColor.value, opacity.value),
    textColor:
      selectedTextColor.value === ''
        ? colorMap['default']?.[theme]
        : selectedTextColor.value,
  });
  clearValues();
};

onMounted(() => {
  if (!props.isSpoiler || !props.styleColors || !props.styleColors.bgColor)
    return;

  selectedBgColor.value = props.styleColors.bgColor
    ? props.styleColors.bgColor.slice(0, 7)
    : '';
  selectedTextColor.value = props.styleColors.textColor;
  opacity.value = props.styleColors.bgColor
    ? getOpacityFromHex(props.styleColors.bgColor)
    : 0.2;
});
</script>

<style scoped>
.main-box-picker {
  max-width: 145px;
  padding: 8px;
}
.spoiler-box-picker {
  max-width: 248px;
}

.background-picker {
  width: 110px;
}

.color-text-picker {
  width: 145px;
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
.approve-btn {
  width: 100%;
  max-height: 30px;
  border-radius: 0px;
}
</style>
