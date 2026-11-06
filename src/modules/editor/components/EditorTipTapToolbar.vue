<template>
  <div ref="toolbarRoot" class="editor-toolbar" :class="{ 'editor-toolbar--mobile': mobile }" role="toolbar" aria-label="Форматирование" @wheel.prevent="handleWheel">
    <button v-if="canScrollBack" type="button" class="editor-toolbar__scroll-arrow editor-toolbar__scroll-arrow--back"
      :aria-label="mobile ? 'Прокрутить инструменты вверх' : 'Прокрутить инструменты влево'"
      @mousedown.prevent @click="scrollToolbar(-1)">
      <v-icon :icon="mobile ? 'mdi-chevron-up' : 'mdi-chevron-left'" size="22" />
    </button>
    <div ref="toolbarVerticalScroll" class="editor-toolbar__scroll" @scroll="updateScrollState">
      <div ref="toolbarScroll" class="editor-toolbar__primary" @scroll="updateScrollState">
    <div class="editor-toolbar__group">
      <template v-if="showHeadings">
        <EditorToolbarSelect
          :model-value="currentHeading"
          :items="EDITOR_HEADING_OPTIONS"
          tooltip="Заголовок"
          heading-preview
          width="128px"
          @update:model-value="setHeading"
        />
        <EditorToolbarButton
          icon="headings"
          tooltip="Вставить оглавление"
          :disabled="isActive('codeBlock')"
          @click="editor.chain().focus().insertDocumentOutline().run()"
        />
      </template>
      <EditorToolbarButton
        icon="bold"
        tooltip="Жирный"
        :active="isActive('bold')"
        @click="editor.chain().focus().toggleBold().run()"
      />
      <EditorToolbarButton
        icon="italic"
        tooltip="Курсив"
        :active="isActive('italic')"
        @click="editor.chain().focus().toggleItalic().run()"
      />
      <EditorToolbarButton
        icon="underline"
        tooltip="Подчеркнутый"
        :active="isActive('underline')"
        @click="editor.chain().focus().toggleUnderline().run()"
      />
      <EditorToolbarButton
        icon="strike"
        tooltip="Зачеркнутый"
        :active="isActive('strike')"
        @click="editor.chain().focus().toggleStrike().run()"
      />
    </div>

    <div class="editor-toolbar__group">
      <EditorToolbarButton
        icon="quote"
        tooltip="Цитата"
        :active="isActive('blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run()"
      />
      <EditorToolbarButton
        icon="code"
        tooltip="Код"
        :active="isActive('codeBlock')"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      />
    </div>

    <div class="editor-toolbar__group">
      <EditorToolbarButton
        icon="list-dot"
        tooltip="Маркированный список"
        :active="isActive('bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
      />
      <EditorToolbarButton
        icon="list-numbered"
        tooltip="Нумерованный список"
        :active="isActive('orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
      />
      <EditorToolbarButton
        icon="check"
        tooltip="Список задач"
        :active="isActive('taskList')"
        @click="editor.chain().focus().toggleTaskList().run()"
      />
      <EditorToolbarButton
        icon="superscript"
        tooltip="Надстрочный индекс"
        :active="isActive('superscript')"
        @click="toggleScript('superscript')"
      />
      <EditorToolbarButton
        icon="subscript"
        tooltip="Подстрочный индекс"
        :active="isActive('subscript')"
        @click="toggleScript('subscript')"
      />
      <EditorSpoilerMenu
        :editor="editor"
        :disabled="isActive('codeBlock')"
      />
      <EditorToolbarButton
        icon="calendar"
        tooltip="Дата"
        :active="isActive('date-node')"
        :disabled="isActive('codeBlock')"
        @click="editor.chain().focus().insertDate().run()"
      />
      <EditorInfoBlockMenu
        :editor="editor"
        :disabled="isActive('codeBlock')"
      />
    </div>

    <div class="editor-toolbar__group">
      <EditorToolbarButton
        icon="indent-left"
        tooltip="Уменьшить отступ"
        :disabled="isIndentDisabled"
        @click="decreaseIndent"
      />
      <EditorToolbarButton
        icon="indent-right"
        tooltip="Увеличить отступ"
        :disabled="isIndentDisabled"
        @click="increaseIndent"
      />
    </div>

    <div class="editor-toolbar__group">
      <EditorToolbarSelect
        :model-value="currentFontSize"
        :items="EDITOR_FONT_SIZES"
        :disabled="isTextStyleDisabled"
        tooltip="Размер шрифта"
        width="72px"
        @update:model-value="setFontSize"
      />
      <EditorToolbarButton
        icon="font-increase"
        tooltip="Увеличить размер шрифта"
        :disabled="isTextStyleDisabled"
        @click="editor.chain().focus().stepFontSize(2).run()"
      />
      <EditorToolbarButton
        icon="font-decrease"
        tooltip="Уменьшить размер шрифта"
        :disabled="isTextStyleDisabled"
        @click="editor.chain().focus().stepFontSize(-2).run()"
      />
      <EditorToolbarSelect
        :model-value="currentFontFamily"
        :items="EDITOR_FONT_FAMILIES"
        :disabled="isTextStyleDisabled"
        tooltip="Шрифт"
        width="112px"
        @update:model-value="setFontFamily"
      />
      <EditorColorMenu
        :editor="editor"
        mode="text"
        :disabled="isActive('codeBlock')"
      />
      <EditorColorMenu
        :editor="editor"
        mode="highlight"
        :disabled="isActive('codeBlock')"
      />
      <EditorAlignmentSelect
        :model-value="currentAlignment"
        :disabled="isActive('codeBlock')"
        @update:model-value="setAlignment"
      />
    </div>

    <div class="editor-toolbar__group">
      <EditorLinkMenu :editor="editor" :enable-anchors="enableAnchors" />
      <EditorAnchorMenu v-if="enableAnchors && !excludedTabs.includes('anchor')" :editor="editor" />
      <EditorImageUploadButton v-if="!disableImages" :editor="editor" />
      <EditorToolbarButton
        icon="table"
        :tooltip="
          showTableToolbar
            ? 'Скрыть панель инструментов таблицы'
            : 'Показать панель инструментов таблицы'
        "
        :active="showTableToolbar"
        @click="showTableToolbar = !showTableToolbar"
      />
      <EditorFormatSampleButton
        :active="formatSampleActive"
        @click="emit('toggleFormatSample')"
      />
      <EditorToolbarButton
        icon="clear-format"
        tooltip="Очистить форматирование"
        :disabled="isActive('codeBlock')"
        @click="editor.chain().focus().unsetAllMarks().run()"
      />
      <EditorEmojiMenu
        :editor="editor"
        :disabled="isActive('codeBlock')"
      />
    </div>

    <div
      v-if="!excludedTabs.includes('drawio') || !excludedTabs.includes('mermaid') || allowFullscreen"
      class="editor-toolbar__group"
    >
      <EditorToolbarButton
        v-if="!excludedTabs.includes('drawio')"
        icon="drawio"
        tooltip="Вставить диаграмму"
        :disabled="isActive('codeBlock')"
        @click="editor.chain().focus().insertDrawio().run()"
      />
      <EditorToolbarButton
        v-if="!excludedTabs.includes('mermaid')"
        icon="account-tree"
        tooltip="Вставить Mermaid диаграмму"
        :disabled="isActive('codeBlock')"
        @click="editor.chain().focus().insertMermaid().run()"
      />
      <EditorToolbarButton
        v-if="allowFullscreen"
        :icon="fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        :tooltip="fullscreen ? 'Свернуть' : 'Развернуть'"
        @click="emit('toggleFullscreen')"
      />
    </div>
      </div>

      <EditorTableToolbar v-if="showTableToolbar" :editor="editor" />
    </div>
    <button v-if="canScrollForward" type="button" class="editor-toolbar__scroll-arrow editor-toolbar__scroll-arrow--forward"
      :aria-label="mobile ? 'Прокрутить инструменты вниз' : 'Прокрутить инструменты вправо'"
      @mousedown.prevent @click="scrollToolbar(1)">
      <v-icon :icon="mobile ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="22" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Level } from '@tiptap/extension-heading';
import type { Editor } from '@tiptap/vue-3';

import { useEditorRevision } from '../composables/useEditorRevision';
import {
  DEFAULT_EDITOR_FONT_SIZE,
  EDITOR_FONT_FAMILIES,
  EDITOR_FONT_SIZES,
  EDITOR_HEADING_OPTIONS,
} from '../constants/editor.constants';
import type { EditorTextAlignment } from '../model/editor.types';
import EditorAlignmentSelect from './EditorAlignmentSelect.vue';
import EditorAnchorMenu from './EditorAnchorMenu.vue';
import EditorColorMenu from './EditorColorMenu.vue';
import EditorEmojiMenu from './EditorEmojiMenu.vue';
import EditorFormatSampleButton from './EditorFormatSampleButton.vue';
import EditorImageUploadButton from './EditorImageUploadButton.vue';
import EditorInfoBlockMenu from './EditorInfoBlockMenu.vue';
import EditorLinkMenu from './EditorLinkMenu.vue';
import EditorSpoilerMenu from './EditorSpoilerMenu.vue';
import EditorTableToolbar from './EditorTableToolbar.vue';
import EditorToolbarButton from './EditorToolbarButton.vue';
import EditorToolbarSelect from './EditorToolbarSelect.vue';

const props = withDefaults(
  defineProps<{
    editor: Editor;
    disableImages?: boolean;
    excludedTabs?: string[];
    formatSampleActive?: boolean;
    fullscreen?: boolean;
    allowFullscreen?: boolean;
    showHeadings?: boolean;
    enableAnchors?: boolean;
    mobile?: boolean;
  }>(),
  {
    disableImages: false,
    excludedTabs: () => [],
    formatSampleActive: false,
    fullscreen: false,
    allowFullscreen: false,
    showHeadings: false,
    enableAnchors: false,
    mobile: false,
  },
);

const emit = defineEmits<{
  toggleFormatSample: [];
  toggleFullscreen: [];
}>();

const revision = useEditorRevision(props.editor);
const showTableToolbar = ref(false);
const toolbarRoot = ref<HTMLElement>();
const toolbarVerticalScroll = ref<HTMLElement>();
const toolbarScroll = ref<HTMLElement>();
const canScrollBack = ref(false);
const canScrollForward = ref(false);
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;

const scrollElement = () => props.mobile ? toolbarVerticalScroll.value : toolbarScroll.value;
const updateScrollState = () => {
  const element = scrollElement();
  if (!element) return;
  const position = props.mobile ? element.scrollTop : element.scrollLeft;
  const maximum = props.mobile
    ? element.scrollHeight - element.clientHeight
    : element.scrollWidth - element.clientWidth;
  canScrollBack.value = position > 1;
  canScrollForward.value = position < maximum - 1;
};

const scrollToolbar = (direction: number) => {
  const element = scrollElement();
  if (!element) return;
  const distance = props.mobile ? 100 : 500;
  if (props.mobile) element.scrollTop += direction * distance;
  else element.scrollLeft += direction * distance;
  updateScrollState();
};

onMounted(() => {
  resizeObserver = new ResizeObserver(updateScrollState);
  for (const element of [toolbarRoot.value, toolbarVerticalScroll.value, toolbarScroll.value]) {
    if (element) resizeObserver.observe(element);
  }
  toolbarRoot.value?.querySelectorAll('.editor-toolbar__group').forEach((element) => {
    resizeObserver?.observe(element);
  });
  mutationObserver = new MutationObserver(updateScrollState);
  if (toolbarRoot.value) mutationObserver.observe(toolbarRoot.value, { childList: true, subtree: true });
  updateScrollState();
});
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
});
watch(() => props.mobile, async () => {
  await nextTick();
  updateScrollState();
});
watch(showTableToolbar, async () => {
  await nextTick();
  updateScrollState();
});

const handleWheel = (event: WheelEvent) => {
  const element = scrollElement();
  if (!element) return;

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY;
  const unit = event.deltaMode === 1 ? 16
    : event.deltaMode === 2
      ? (props.mobile ? element.clientHeight : element.clientWidth) : 1;
  if (props.mobile) element.scrollTop += delta * unit;
  else element.scrollLeft += delta * unit;
  updateScrollState();
};

const isActive = (name: string, attributes?: Record<string, unknown>) => {
  void revision.value;
  return props.editor.isActive(name, attributes);
};

const currentHeading = computed<Level | 0>(() => {
  void revision.value;

  return (
    EDITOR_HEADING_OPTIONS.find(
      ({ value }) => value !== 0 && props.editor.isActive('heading', { level: value }),
    )?.value ?? 0
  );
});

const currentFontSize = computed(() => {
  void revision.value;
  const { from, to, empty } = props.editor.state.selection;
  if (!empty) {
    const sizes = new Set<string>();
    props.editor.state.doc.nodesBetween(from, to, (node) => {
      if (!node.isText) return;
      sizes.add(node.marks.find((mark) => mark.type.name === 'textStyle')?.attrs.fontSize ?? DEFAULT_EDITOR_FONT_SIZE);
    });
    if (sizes.size > 1) return '—';
    if (sizes.size === 1) return [...sizes][0];
  }
  return (
    props.editor.getAttributes('textStyle').fontSize ??
    DEFAULT_EDITOR_FONT_SIZE
  );
});

const currentFontFamily = computed(() => {
  void revision.value;
  return props.editor.getAttributes('textStyle').fontFamily ?? 'sans-serif';
});

const currentAlignment = computed<EditorTextAlignment>(() => {
  void revision.value;

  return (
    (['center', 'right', 'justify'] as const).find((textAlign) =>
      props.editor.isActive({ textAlign }),
    ) ?? 'left'
  );
});

const isTextStyleDisabled = computed(() => {
  void revision.value;
  return props.editor.isActive('codeBlock') || props.editor.isActive('heading');
});

const isIndentDisabled = computed(() => {
  void revision.value;
  return props.editor.isActive('codeBlock');
});

const setHeading = (value: string | number) => {
  if (value === 0) {
    props.editor.chain().focus().setParagraph().run();
    return;
  }

  props.editor
    .chain()
    .focus()
    .setHeading({ level: value as Level })
    .run();
};

const setFontSize = (value: string | number) => {
  if (typeof value === 'string') {
    props.editor.chain().focus().setFontSize(value).run();
  }
};

const setFontFamily = (value: string | number) => {
  if (typeof value === 'string') {
    props.editor.chain().focus().setFontFamily(value).run();
  }
};

const setAlignment = (value: EditorTextAlignment) => {
  props.editor.chain().focus().setTextAlign(value).run();
};

const increaseIndent = () => {
  if (props.editor.isActive('taskItem')) {
    props.editor.chain().focus().sinkListItem('taskItem').run();
    return;
  }

  if (props.editor.isActive('listItem')) {
    props.editor.chain().focus().sinkListItem('listItem').run();
    return;
  }

  props.editor.chain().focus().increaseBlockIndent().run();
};

const decreaseIndent = () => {
  if (props.editor.isActive('taskItem')) {
    props.editor.chain().focus().liftListItem('taskItem').run();
    return;
  }

  if (props.editor.isActive('listItem')) {
    props.editor.chain().focus().liftListItem('listItem').run();
    return;
  }

  props.editor.chain().focus().decreaseBlockIndent().run();
};

const toggleScript = (type: 'superscript' | 'subscript') => {
  const chain = props.editor.chain().focus();

  if (type === 'superscript') {
    chain.toggleSuperscript().run();
  } else {
    chain.toggleSubscript().run();
  }

};
</script>

<style scoped>
.editor-toolbar {
  overflow: hidden;
  position: sticky;
  top: var(--editor-sticky-top, 0px);
  z-index: 10;
  flex-shrink: 0;
  padding: 0 8px;
  border-bottom: 1px solid rgb(var(--v-theme-border));
  border-radius: 8px 8px 0 0;
  background-color: rgb(var(--v-theme-background));
}

.editor-toolbar__scroll { min-width: 0; }

.editor-toolbar__scroll-arrow {
  position: absolute;
  z-index: 2;
  top: 11px;
  display: flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-text));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-border));
  cursor: pointer;
}
@media (hover: hover) {
  .editor-toolbar__scroll-arrow {
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }
  .editor-toolbar:hover .editor-toolbar__scroll-arrow,
  .editor-toolbar__scroll-arrow:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
}
.editor-toolbar__scroll-arrow:hover,
.editor-toolbar__scroll-arrow:focus-visible {
  background: rgb(var(--v-theme-surface));
}
.editor-toolbar__scroll-arrow--back { left: 3px; }
.editor-toolbar__scroll-arrow--forward { right: 3px; }

.editor-toolbar__primary {
  display: flex;
  min-height: 40px;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.editor-toolbar__primary::-webkit-scrollbar {
  display: none;
}

.editor-toolbar__group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
}

.editor-toolbar__group:not(:last-child)::after {
  width: 1px;
  height: 24px;
  margin-left: 0;
  background-color: rgb(var(--v-theme-border));
  content: '';
}

.editor-toolbar__group:last-child {
  padding-right: 2px;
}

.editor-toolbar__primary :deep(.v-btn--icon) {
  width: 24px;
  min-width: 24px;
  height: 24px;
}

.editor-toolbar--mobile {
  grid-column: 1;
  grid-row: 1;
  position: sticky;
  top: var(--editor-sticky-top, 0px);
  width: 52px;
  height: min(var(--editor-mobile-body-height, 240px), calc(100dvh - var(--editor-sticky-top, 0px)));
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  border-right: 1px solid rgb(var(--v-theme-border));
  border-bottom: 0;
  border-radius: 8px 0 0 8px;
}

.editor-toolbar--mobile .editor-toolbar__scroll {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.editor-toolbar--mobile .editor-toolbar__scroll::-webkit-scrollbar { display: none; }
.editor-toolbar--mobile .editor-toolbar__scroll-arrow {
  top: auto;
  left: 14px;
}
.editor-toolbar--mobile .editor-toolbar__scroll-arrow--back { top: 3px; }
.editor-toolbar--mobile .editor-toolbar__scroll-arrow--forward { right: auto; bottom: 3px; }

.editor-toolbar--mobile .editor-toolbar__primary,
.editor-toolbar--mobile .editor-toolbar__group,
.editor-toolbar--mobile :deep(.editor-table-toolbar) {
  flex-direction: column;
  align-items: center;
  overflow: visible;
}

.editor-toolbar--mobile .editor-toolbar__primary {
  min-height: 0;
  padding: 8px 0;
  gap: 6px;
}

.editor-toolbar--mobile .editor-toolbar__group {
  width: 100%;
  gap: 6px;
}

.editor-toolbar--mobile .editor-toolbar__group:not(:last-child)::after {
  width: 24px;
  height: 1px;
  margin: 0;
}

.editor-toolbar--mobile .editor-toolbar__group:last-child { padding-right: 0; }
.editor-toolbar--mobile :deep(.editor-toolbar-select) { width: 42px !important; }
.editor-toolbar--mobile :deep(.editor-toolbar-select .v-field) { min-width: 0; }
.editor-toolbar--mobile :deep(.editor-toolbar-select .v-field__input) {
  min-width: 0;
  overflow: hidden;
}
.editor-toolbar--mobile :deep(.editor-table-toolbar) {
  border-top: 1px solid rgb(var(--v-theme-border));
  width: 100%;
  padding: 8px 0;
  gap: 6px;
}
</style>

