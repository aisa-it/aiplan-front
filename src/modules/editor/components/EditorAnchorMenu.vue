<template>
  <v-tooltip :text="t('editor.anchor')" location="bottom">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :aria-label="t('editor.anchor')"
        icon="mdi-bookmark"
        size="small"
        variant="text"
        color="text"
        class="editor-anchor-menu__button"
        @mousedown.prevent
        @click.stop="openAtCaret"
      />
    </template>
  </v-tooltip>

  <v-menu
    v-model="open"
    :target="caretTarget"
    location="bottom start"
    :offset="0"
    :close-on-content-click="false"
  >
    <div class="editor-anchor-menu" @click.stop>
      <form @submit.prevent="insertAnchor">
        <div class="editor-anchor-menu__actions">
          <v-btn
            type="submit"
            icon="mdi-content-save"
            :aria-label="t('editor.saveAnchor')"
            size="x-small"
            color="primary"
            class="editor-anchor-menu__action"
          />
          <v-btn
            icon="mdi-close"
            :aria-label="t('editor.cancelCreatingAnchor')"
            size="x-small"
            class="editor-anchor-menu__action editor-anchor-menu__cancel"
            @click="open = false"
          />
        </div>
        <div class="editor-anchor-menu__input">
          <v-text-field
            v-model="title"
            :label="t('editor.anchorName')"
            density="compact"
            variant="underlined"
            hide-details
            autofocus
          />
        </div>
      </form>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { onBeforeUnmount, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';

import { collectAnchorIds, makeUniqueSlug } from '../utils/editorAnchorSlug';

const { t } = useI18n();

const props = defineProps<{ editor: Editor }>();
const open = ref(false);
const title = ref('');
const caretTarget = ref<[number, number]>();

const openAtCaret = () => {
  title.value = '';
  try {
    const { view, state } = props.editor;
    const coords = view.coordsAtPos(state.selection.from);
    caretTarget.value = [coords.left - 32, coords.bottom - 41];
  } catch {
    const coords = props.editor.view.dom.getBoundingClientRect();
    caretTarget.value = [coords.left, coords.top];
  }
  open.value = true;
};

const closeOnScroll = () => {
  open.value = false;
};
watch(open, (value) => {
  if (value) window.addEventListener('scroll', closeOnScroll, true);
  else window.removeEventListener('scroll', closeOnScroll, true);
});
onBeforeUnmount(() =>
  window.removeEventListener('scroll', closeOnScroll, true),
);

const insertAnchor = () => {
  const value = title.value.trim();
  if (!value) return;
  const anchorId = makeUniqueSlug(
    value,
    collectAnchorIds(props.editor.state.doc),
  );
  props.editor.chain().focus().setDocAnchor({ anchorId, title: value }).run();
  open.value = false;
};
</script>

<style scoped>
.editor-anchor-menu__button {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}
.editor-anchor-menu {
  width: 300px;
}
.editor-anchor-menu__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 4px;
}
.editor-anchor-menu__action {
  width: 28px;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
}
.editor-anchor-menu__cancel {
  background: #a34b4b;
}
.editor-anchor-menu__input {
  padding: 7px 8px 28px;
  border: 1px solid #808080;
  border-radius: 8px;
  background: rgb(var(--v-theme-background));
}
</style>
