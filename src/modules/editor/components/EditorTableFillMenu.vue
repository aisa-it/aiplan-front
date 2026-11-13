<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="t('editor.cellFill')" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            icon
            size="small"
            variant="text"
            :disabled="disabled"
            :aria-label="t('editor.cellFill')"
            class="editor-table-fill-menu__activator"
            @mousedown.prevent
          >
            <v-icon icon="mdi-format-color-fill" size="20" />
            <span
              class="editor-table-fill-menu__preview"
              :class="{
                'editor-table-fill-menu__preview--empty': !currentColor,
              }"
              :style="{ backgroundColor: currentColor?.color }"
            />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card class="editor-table-fill-menu__card" elevation="4">
      <div class="editor-table-fill-menu__palette">
        <button
          type="button"
          :title="t('editor.none')"
          :aria-label="t('editor.none')"
          class="editor-table-fill-menu__swatch editor-table-fill-menu__swatch--empty"
          :class="{
            'editor-table-fill-menu__swatch--active': !currentColor,
          }"
          @click="selectColor(null)"
          @mousedown.prevent
        />

        <button
          v-for="color in resolvedColors"
          :key="color.value"
          type="button"
          :title="color.label"
          :aria-label="color.label"
          class="editor-table-fill-menu__swatch"
          :class="{
            'editor-table-fill-menu__swatch--active':
              color.value === currentColor?.value,
          }"
          :style="{ backgroundColor: color.color }"
          @click="selectColor(color.value)"
          @mousedown.prevent
        />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';

import { useEditorRevision } from '../composables/useEditorRevision';
import { EDITOR_TABLE_CELL_COLORS } from '../constants/editor.constants';

const { t } = useI18n();

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

const resolvedColors = computed(() =>
  EDITOR_TABLE_CELL_COLORS.map((color) => ({
    ...color,
    color: theme.current.value.dark ? color.dark : color.light,
  })),
);

const currentColor = computed(() => {
  void revision.value;

  const type = props.editor.isActive('tableHeader')
    ? 'tableHeader'
    : 'tableCell';
  const value = props.editor.getAttributes(type)['data-bgcolor'];

  return resolvedColors.value.find((color) => color.value === value);
});

const selectColor = (value: string | null) => {
  props.editor
    .chain()
    .focus()
    .setCellAttribute('backgroundColor', null)
    .setCellAttribute('data-bgcolor', value)
    .run();
  isOpen.value = false;
};
</script>

<style scoped>
.editor-table-fill-menu__activator {
  position: relative;
  width: 32px;
  min-width: 32px;
  height: 32px;
  border-radius: 6px;
}

.editor-table-fill-menu__preview {
  position: absolute;
  right: 7px;
  bottom: 4px;
  left: 7px;
  height: 3px;
  border-radius: 2px;
}

.editor-table-fill-menu__preview--empty,
.editor-table-fill-menu__swatch--empty {
  background:
    linear-gradient(
      to bottom right,
      transparent 46%,
      rgb(var(--v-theme-error)) 47%,
      rgb(var(--v-theme-error)) 53%,
      transparent 54%
    );
}

.editor-table-fill-menu__card {
  padding: 8px;
}

.editor-table-fill-menu__palette {
  display: grid;
  grid-template-columns: repeat(4, 28px);
  gap: 6px;
}

.editor-table-fill-menu__swatch {
  width: 28px;
  height: 28px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 6px;
}

.editor-table-fill-menu__swatch:hover,
.editor-table-fill-menu__swatch--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
</style>
