<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Спойлер" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            aria-label="Спойлер"
            :class="{ 'editor-spoiler-menu__button--active': isActive }"
            :color="isActive ? 'primary' : 'text'"
            :disabled="disabled"
            icon
            size="small"
            variant="text"
            class="editor-spoiler-menu__button"
          >
            <EditorIcon name="spoiler" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card class="editor-spoiler-menu__card" elevation="4">
      <div class="editor-spoiler-menu__label">Цвет фона</div>
      <div class="editor-spoiler-menu__palette">
        <button
          v-for="color in backgroundColors"
          :key="color.value"
          type="button"
          :title="color.label"
          :aria-label="color.label"
          class="editor-spoiler-menu__swatch"
          :class="{
            'editor-spoiler-menu__swatch--active':
              color.value === backgroundColor,
          }"
          :style="{ backgroundColor: color.value }"
          @click="backgroundColor = color.value"
        />
      </div>

      <div class="editor-spoiler-menu__label">Цвет текста</div>
      <div class="editor-spoiler-menu__palette">
        <button
          v-for="color in textColors"
          :key="color.value"
          type="button"
          :title="color.label"
          :aria-label="color.label"
          class="editor-spoiler-menu__swatch"
          :class="{
            'editor-spoiler-menu__swatch--active': color.value === textColor,
          }"
          :style="{
            backgroundColor: 'rgb(var(--v-theme-surface))',
            color: color.value,
          }"
          @click="textColor = color.value"
        >
          A
        </button>
      </div>

      <div class="editor-spoiler-menu__label">Прозрачность</div>
      <v-slider
        v-model="opacity"
        aria-label="Прозрачность фона"
        :min="0"
        :max="1"
        :step="0.01"
        hide-details
        color="primary"
      />

      <v-btn block color="primary" size="small" @click="applySpoiler">
        Применить
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';

import { useEditorRevision } from '../composables/useEditorRevision';
import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_TEXT_COLORS,
} from '../constants/editor.constants';
import EditorIcon from './EditorIcon.vue';
import { getSelectedEditorBlock } from '../utils/selectEditorBlockContent';

const props = withDefaults(
  defineProps<{
    editor: Editor;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const theme = useTheme();
const revision = useEditorRevision(props.editor);
const isOpen = ref(false);
const opacity = ref(0.2);
const backgroundColor = ref('');
const textColor = ref('');

const isDark = computed(() => theme.current.value.dark);
const isActive = computed(() => {
  void revision.value;
  return props.editor.isActive('spoiler');
});
const backgroundColors = computed(() =>
  EDITOR_HIGHLIGHT_COLORS.map((color) => ({
    label: color.label,
    value: isDark.value ? color.dark : color.light,
  })),
);
const textColors = computed(() =>
  EDITOR_TEXT_COLORS.map((color) => ({
    label: color.label,
    value: isDark.value ? color.dark : color.light,
  })),
);

const getActiveSpoiler = () => getSelectedEditorBlock(props.editor, 'spoiler');

const withOpacity = (color: string, value: number) => {
  const alpha = Math.round(value * 255)
    .toString(16)
    .padStart(2, '0');
  return `${color}${alpha}`;
};

const readColor = (color: string) => {
  if (color === 'transparent') return { hex: '#000000', alpha: 0 };
  const match = color.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return undefined;

  const channels = match[1].split(',').map(Number);
  if (
    channels.length < 3 ||
    channels.some((value) => !Number.isFinite(value))
  ) {
    return undefined;
  }
  const hex = channels
    .slice(0, 3)
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('');
  return {
    hex: `#${hex}`.toUpperCase(),
    alpha: channels[3] ?? 1,
  };
};

const applySpoiler = () => {
  const style = `background-color: ${withOpacity(backgroundColor.value, opacity.value)}; color: ${textColor.value};`;
  const activeSpoiler = getActiveSpoiler();

  if (activeSpoiler) {
    const transaction = props.editor.state.tr.setNodeMarkup(
      activeSpoiler.pos,
      undefined,
      { ...activeSpoiler.node.attrs, style },
    );
    props.editor.view.dispatch(transaction);
  } else {
    props.editor.chain().focus().setSpoiler({ style }).run();
  }

  isOpen.value = false;
};

watch(isOpen, (open) => {
  if (!open) return;

  backgroundColor.value = backgroundColors.value[0]?.value ?? '';
  textColor.value = textColors.value[0]?.value ?? '';
  opacity.value = 0.2;

  const activeSpoiler = getActiveSpoiler();
  if (!activeSpoiler) return;

  const style = document.createElement('span').style;
  style.cssText = activeSpoiler.node.attrs.style ?? '';
  const background = readColor(style.backgroundColor);
  if (background) {
    backgroundColor.value = background.hex;
    opacity.value = background.alpha;
  }
  if (style.color) {
    const text = readColor(style.color);
    textColor.value = text?.alpha === 1 ? text.hex : style.color;
  }
});
</script>

<style scoped>
.editor-spoiler-menu__button {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

.editor-spoiler-menu__button--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.editor-spoiler-menu__card {
  width: 220px;
  padding: 10px;
}

.editor-spoiler-menu__label {
  margin-bottom: 4px;
  font-size: 12px;
}

.editor-spoiler-menu__palette {
  display: grid;
  grid-template-columns: repeat(7, 24px);
  gap: 4px;
  margin-bottom: 10px;
}

.editor-spoiler-menu__swatch {
  width: 24px;
  height: 24px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 4px;
  font-weight: 500;
}

.editor-spoiler-menu__swatch:hover,
.editor-spoiler-menu__swatch--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
</style>
