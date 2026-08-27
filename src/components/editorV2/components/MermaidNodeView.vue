<template>
  <node-view-wrapper
    class="mermaid-block"
    :class="{ 'mermaid-block--editable': !isReadOnly }"
  >
    <div
      v-if="!isReadOnly"
      class="mermaid-block__header"
      contenteditable="false"
    >
      <q-icon name="account_tree" size="16px" />
      <span class="mermaid-block__title">Mermaid</span>
      <q-btn
        class="mermaid-block__delete"
        dense
        flat
        size="sm"
        @click="deleteNode()"
      >
        <q-icon name="delete" size="16px" />
        <HintTooltip>Удалить диаграмму</HintTooltip>
      </q-btn>
    </div>

    <!--
      Источник всегда в DOM (v-show, не v-if): здесь живёт contentDOM
      ProseMirror, и убирать его при переходе в read-only нельзя —
      редактор переключает editable без пересоздания node view.
    -->
    <pre
      v-show="!isReadOnly"
      class="mermaid-block__source"
    ><node-view-content /></pre>

    <div class="mermaid-block__preview" contenteditable="false">
      <div v-if="loading" class="mermaid-block__hint">
        <q-spinner size="16px" />
        <span>Загрузка диаграммы…</span>
      </div>
      <div v-else-if="!source.trim()" class="mermaid-block__hint">
        <span>Введите текст диаграммы</span>
      </div>
      <div v-else-if="errorText" class="mermaid-block__error">
        <q-icon name="error_outline" size="16px" />
        <span>{{ errorText }}</span>
      </div>
      <!-- SVG собран mermaid из текста при securityLevel: strict -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else class="mermaid-block__svg" v-html="svg"></div>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from '@tiptap/vue-3';
import { useQuasar } from 'quasar';
import { renderMermaidSvg } from 'src/utils/mermaidRender';

const props = defineProps(nodeViewProps);

const $q = useQuasar();

const injectedReadOnly = inject('isEditorReadOnly', ref(false));
const isReadOnly = computed(
  () => injectedReadOnly.value || !props.editor?.isEditable,
);

const svg = ref('');
const errorText = ref('');
const loading = ref(true);

const source = computed(() => props.node.textContent);

// Токен отсекает устаревшие результаты: рендер асинхронный, и ответ
// на старый текст может прийти после ответа на новый.
let renderToken = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const render = async () => {
  const token = ++renderToken;
  const code = source.value.trim();

  if (!code) {
    svg.value = '';
    errorText.value = '';
    loading.value = false;
    return;
  }

  try {
    const result = await renderMermaidSvg(code, $q.dark.isActive);
    if (token !== renderToken) return;
    svg.value = result;
    errorText.value = '';
  } catch (error) {
    if (token !== renderToken) return;
    svg.value = '';
    errorText.value =
      error instanceof Error ? error.message : 'Не удалось построить диаграмму';
  } finally {
    if (token === renderToken) loading.value = false;
  }
};

const scheduleRender = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 400);
};

watch(source, scheduleRender);
// Тема mermaid глобальная — при переключении тёмного режима диаграмма
// перерисовывается, иначе останется в цветах старой темы.
watch(() => $q.dark.isActive, render);

onMounted(render);

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  renderToken++;
});
</script>

<style lang="scss" scoped>
.mermaid-block {
  margin: 8px 0;
}

.mermaid-block--editable {
  // $dark-border-color — CSS-переменная, сама меняется по теме.
  border: 1px solid $dark-border-color;
  border-radius: 8px;
}

.mermaid-block__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: $dark-gray;
  border-bottom: 1px solid $dark-border-color;
  user-select: none;
}

.mermaid-block__title {
  flex: 1 1 auto;
}

.mermaid-block__delete {
  flex: 0 0 auto;
}

.mermaid-block__source {
  margin: 0;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  border-bottom: 1px dashed $dark-border-color;
}

.mermaid-block__preview {
  padding: 8px 12px;
  overflow-x: auto;
}

.mermaid-block__svg {
  display: flex;
  justify-content: center;

  :deep(svg) {
    max-width: 100%;
    height: auto;
  }
}

.mermaid-block__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: $dark-gray;
}

.mermaid-block__error {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: $negative;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
