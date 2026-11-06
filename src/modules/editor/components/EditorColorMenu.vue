<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="tooltip" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            :aria-label="tooltip"
            color="text"
            :disabled="disabled"
            icon
            size="small"
            variant="text"
            class="editor-color-menu__activator"
          >
            <EditorIcon :name="icon" />
            <span
              class="editor-color-menu__preview"
              :class="{
                'editor-color-menu__preview--empty':
                  mode === 'highlight' && !currentColor,
              }"
              :style="{ backgroundColor: currentColor || 'transparent' }"
            />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card class="editor-color-menu__card" elevation="4">
      <div class="editor-color-menu__palette">
        <button
          v-if="mode === 'highlight'"
          type="button"
          title="Отсутствует"
          aria-label="Отсутствует"
          class="editor-color-menu__swatch editor-color-menu__swatch--empty"
          :class="{
            'editor-color-menu__swatch--active': !currentColor,
          }"
          @click="clearColor"
        />

        <button
          v-for="color in resolvedColors"
          :key="color.value"
          type="button"
          :title="color.label"
          :aria-label="color.label"
          class="editor-color-menu__swatch"
          :class="{
            'editor-color-menu__swatch--active': color.value === currentColor,
          }"
          :style="{
            backgroundColor:
              mode === 'highlight'
                ? color.value
                : 'rgb(var(--v-theme-surface))',
            color: mode === 'text' ? color.value : undefined,
          }"
          @click="selectColor(color.value)"
        >
          A
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';

import { useEditorRevision } from '../composables/useEditorRevision';
import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_TEXT_COLORS,
} from '../constants/editor.constants';
import type { EditorColorMode } from '../model/editor.types';
import type { EditorIconName } from '../icons/editor-icons';
import EditorIcon from './EditorIcon.vue';

const props = withDefaults(
  defineProps<{
    editor: Editor;
    mode: EditorColorMode;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const theme = useTheme();
const revision = useEditorRevision(props.editor);
const isOpen = ref(false);

const isDark = computed(() => theme.current.value.dark);
const tooltip = computed(() =>
  props.mode === 'text' ? 'Цвет шрифта' : 'Выделить',
);
const icon = computed<EditorIconName>(() =>
  props.mode === 'text' ? 'font-color' : 'font-background',
);
const colors = computed(() =>
  props.mode === 'text' ? EDITOR_TEXT_COLORS : EDITOR_HIGHLIGHT_COLORS,
);
const resolvedColors = computed(() =>
  colors.value.map((color) => ({
    label: color.label,
    value: isDark.value ? color.dark : color.light,
  })),
);
const currentColor = computed<string | undefined>(() => {
  void revision.value;

  return props.mode === 'text'
    ? props.editor.getAttributes('textStyle').color
    : props.editor.getAttributes('highlight').color;
});

const selectColor = (color: string) => {
  if (props.mode === 'text') {
    props.editor.chain().focus().setColor(color).run();
  } else {
    props.editor.chain().focus().setHighlight({ color }).run();
  }

  isOpen.value = false;
};

const clearColor = () => {
  if (props.mode === 'text') {
    props.editor.chain().focus().unsetColor().run();
  } else {
    props.editor.chain().focus().unsetHighlight().run();
  }

  isOpen.value = false;
};
</script>

<style scoped>
.editor-color-menu__activator {
  position: relative;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

.editor-color-menu__preview {
  position: absolute;
  right: 4px;
  bottom: 1px;
  left: 4px;
  height: 3px;
  border-radius: 2px;
}

.editor-color-menu__preview--empty,
.editor-color-menu__swatch--empty {
  background:
    linear-gradient(
      to bottom right,
      transparent 46%,
      rgb(var(--v-theme-error)) 47%,
      rgb(var(--v-theme-error)) 53%,
      transparent 54%
    );
}

.editor-color-menu__card {
  padding: 8px;
}

.editor-color-menu__palette {
  display: grid;
  grid-template-columns: repeat(4, 28px);
  gap: 6px;
}

.editor-color-menu__swatch {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
}

.editor-color-menu__swatch:hover,
.editor-color-menu__swatch--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
</style>
