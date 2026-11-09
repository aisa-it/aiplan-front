<template>
  <NodeViewWrapper as="span" class="editor-date-node">
    <button
      type="button"
      class="editor-date-node__button"
      :disabled="readonly"
      contenteditable="false"
      @click.stop="openPicker"
    >
      <v-icon icon="mdi-calendar-month-outline" size="18" />
      {{ node.attrs.date }}
    </button>

    <v-menu
      v-model="isOpen"
      activator="parent"
      :open-on-click="false"
      :close-on-content-click="false"
    >
      <v-card class="editor-date-node__menu" elevation="4">
        <v-text-field
          v-model="inputDate"
          type="date"
          :label="t('editor.date')"
          density="compact"
          hide-details
          variant="outlined"
        />
        <v-card-actions>
          <v-btn variant="text" @click="isOpen = false"> {{ t('editor.cancel') }} </v-btn>
          <v-btn color="primary" variant="text" :disabled="!toEditorDate(inputDate)" @click="saveDate">
            {{ t('editor.select') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, inject, ref, watch } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import { EDITOR_READONLY_KEY } from '../model/editor.injection';
import { toInputDate, toEditorDate } from '../utils/editorDate';

const { t } = useI18n();

const props = defineProps(nodeViewProps);
const injectedReadonly = inject(EDITOR_READONLY_KEY);
const readonly = computed(
  () => injectedReadonly?.value ?? !props.editor.isEditable,
);
const isOpen = ref(false);
const inputDate = ref('');

const openPicker = () => {
  if (readonly.value) return;

  inputDate.value = toInputDate(props.node.attrs.date);
  isOpen.value = true;
};

const saveDate = () => {
  const date = toEditorDate(inputDate.value);
  if (!date) return;

  props.updateAttributes({ date });
  isOpen.value = false;
};

watch(readonly, (value) => {
  if (value) isOpen.value = false;
});
</script>

<style scoped>
.editor-date-node__button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  border-left: 2px solid currentcolor;
  background-color: var(--editor-date-bg);
  color: inherit;
  font-style: italic;
  cursor: pointer;
}

.editor-date-node__button:disabled {
  cursor: default;
}

.editor-date-node__menu {
  width: 250px;
  padding: 12px 12px 4px;
}
</style>
