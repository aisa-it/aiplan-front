<template>
  <div
    v-if="editorInstance"
    ref="editorToolbar"
    class="html-editor__toolbar"
    :class="classPrevent"
    :style="{ width: isMobile ? 'auto' : '100%' }"
  >
    <div v-if="!isReadOnly" class="container-btn-scroll">
      <v-btn
        icon
        variant="flat"
        size="small"
        density="compact"
        :style="getScrollBtnState(firstArrowState)"
        class="btn-scroll-attachments"
        @click.stop="scroll(-scrollSpeed)"
      >
        <v-icon
          size="22"
          :icon="isMobile ? 'mdi-chevron-up' : 'mdi-chevron-left'"
        />
      </v-btn>
      <v-btn
        icon
        variant="flat"
        size="small"
        density="compact"
        :style="getScrollBtnState(secondArrowState)"
        class="btn-scroll-attachments"
        @click.stop="scroll(scrollSpeed)"
      >
        <v-icon
          size="22"
          :icon="isMobile ? 'mdi-chevron-down' : 'mdi-chevron-right'"
        />
      </v-btn>
    </div>
    <div
      @scroll="scrollManager?.updateBtnVisible()"
      class="html-editor__toolbar-wrap"
      ref="editorToolbarScroll"
    >
      <div
        class="html-editor__toolbar-primary"
        :class="{ 'html-editor__toolbar-readonly': isReadOnly }"
      >
        <div v-if="isReadOnly" class="html-editor__formats">
          <v-btn
            icon
            variant="text"
            size="small"
            density="compact"
            @click="emits('enableEditing')"
          >
            <component :is="ICONS.editIcon" />
            <HintTooltip>Редактировать</HintTooltip>
          </v-btn>
        </div>
        <template v-else>
          <div class="html-editor__formats">
            <EditorHeadingSelect
              v-if="props.showHeadings"
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />

            <EditorFormatButton
              v-if="props.showHeadings"
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="setTableOfContents"
              tooltip="Оглавление"
              icon-name="headingsIcon"
              format-name="tableOfContents"
            />

            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleBold"
              tooltip="Жирный"
              icon-name="boldIcon"
              format-name="bold"
            />

            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleItalic"
              tooltip="Курсив"
              icon-name="italicIcon"
              format-name="italic"
            />

            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleUnderline"
              tooltip="Подчеркнутый"
              icon-name="underlineIcon"
              format-name="underline"
            />

            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleStrike"
              tooltip="Зачеркнутый"
              icon-name="strikeIcon"
              format-name="strike"
            />
          </div>
          <div class="html-editor__formats">
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleBlockquote"
              tooltip="Цитата"
              icon-name="quoteIcon"
              format-name="blockquote"
            />

            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleCodeBlock"
              tooltip="Код"
              icon-name="codeIcon"
              format-name="codeBlock"
            />
          </div>
          <div class="html-editor__formats">
            <EditorMarkListButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleBulletList"
              tooltip="Маркированный список"
              icon-name="listDotIcon"
              format-name="bulletList"
            />
            <EditorMarkListButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleOrderedList"
              tooltip="Нумерованный список"
              icon-name="listNumIcon"
              format-name="orderedList"
            />
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="toggleTaskList"
              tooltip="Список задач"
              icon-name="checkIcon"
              format-name="taskList"
            />
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              @run-command="
                (command) => handleSuperscript(command as 'toggleSuperscript')
              "
              command="toggleSuperscript"
              has-run-command-listener
              tooltip="Верхний регистр"
              icon-name="superScriptIcon"
              format-name="superscript"
            />
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              @run-command="
                (command) => handleSuperscript(command as 'toggleSubscript')
              "
              command="toggleSubscript"
              has-run-command-listener
              tooltip="Нижний регистр"
              icon-name="subScriptIcon"
              format-name="subscript"
            />
          </div>

          <div class="html-editor__formats">
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="outdent"
              tooltip="Уменьшить отступ"
              icon-name="textIndentLeftIcon"
            />
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="indent"
              tooltip="Увеличить отступ"
              icon-name="textIndentRightIcon"
            />
          </div>

          <div class="html-editor__formats">
            <EditorFontSizeSelect
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
            <EditorFontSizeButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="increment"
              tooltip="Увеличить размер шрифта"
              icon-name="fontIncreaseIcon"
            />
            <EditorFontSizeButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="decrement"
              tooltip="Уменьшить размер шрифта"
              icon-name="fontDecreaseIcon"
            />
            <EditorFontSelect
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
            <EditorColorPicker
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
            <EditorBgColorPicker
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
            <EditorAlignSelect
              :editor-instance="editorInstance"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
          </div>

          <div class="html-editor__formats">
            <EditorLinkButtonTwo :editor-instance="editorInstance" />
            <EditorUploadButton
              v-if="!disableImages"
              :editor-instance="editorInstance"
              :isMobile="isMobile"
            />
            <EditorTableButton
              @show-toolbar="showToolbarTable = !showToolbarTable"
            />
            <EditorFormatSampleButton
              :editor-instance="editorInstance"
              :is-format-sample-active="isFormatSampleActive"
              :isMobile="isMobile"
              @toggle-format-sample="emits('toggleFormatSample')"
            />
            <EditorFormatButton
              :editorInstance="editorInstance"
              :isMobile="isMobile"
              command="unsetAllMarks"
              tooltip="Очистить форматировние"
              icon-name="clearFormatIcon"
            />
            <EditorEmoji
              :editor-instance="editorInstance"
              :class-prevent="classPrevent"
              :isMobile="isMobile"
            />
          </div>

          <EditorFullScreenButton
            v-if="$props.isFullScreen"
            :style="`margin: ${isMobile ? '0 auto' : ' 0 0 0 auto'}`"
            @click="emits('toggle-fullscreen')"
          />
        </template>
      </div>
      <EditorTableToolbar
        v-if="!isReadOnly"
        :editor-instance="editorInstance"
        :is-show-toolbar="showToolbarTable"
        :isMobile="isMobile"
        class="html-editor__toolbar-secondary"
        :class-prevent="classPrevent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { ICONS } from '@/utils/icons';
import { mouseWheelScrollHandler } from '@/utils/mouseWheelScrollHandler';
import { ScrollManager } from '@/utils/scrollBtnManager';
// TODO: constants/tiptap — not migrated yet
// import { TIPTAP_TABS } from 'src/constants/tiptap';
import HintTooltip from './HintTooltip.vue';
import EditorEmoji from './EditorEmoji.vue';
import EditorFontSelect from './EditorFontSelect.vue';
import EditorAlignSelect from './EditorAlignSelect.vue';
import EditorColorPicker from './EditorColorPicker.vue';
import EditorTableButton from './EditorTableButton.vue';
import EditorFormatButton from './EditorFormatButton.vue';
import EditorUploadButton from './EditorUploadButton.vue';
import EditorTableToolbar from './EditorTableToolbar.vue';
import EditorBgColorPicker from './EditorBgColorPicker.vue';
import EditorFontSizeSelect from './EditorFontSizeSelect.vue';
import EditorFontSizeButton from './EditorFontSizeButton.vue';
import EditorFormatSampleButton from './EditorFormatSampleButton.vue';
import EditorFullScreenButton from './EditorFullScreenButton.vue';
import EditorMarkListButton from './EditorMarkListButton.vue';
import EditorLinkButtonTwo from './EditorLinkButtonTwo.vue';
import EditorHeadingSelect from './EditorHeadingSelect.vue';

interface IEditorTiptapToolbarProps {
  editorInstance: Editor | null;
  isReadOnly?: boolean;
  isFormatSampleActive?: boolean;
  classPrevent?: string;
  disableImages?: boolean;
  isFullScreen?: boolean;
  isMobile?: boolean;
  showHeadings?: boolean;
}

const props = withDefaults(defineProps<IEditorTiptapToolbarProps>(), {
  isReadOnly: false,
  isFormatSampleActive: false,
  disableImages: false,
  isFullScreen: false,
  isMobile: false,
  showHeadings: false,
});

const emits = defineEmits<{
  enableEditing: [];
  toggleFormatSample: [];
  'toggle-fullscreen': [];
}>();

const { smAndDown } = useDisplay();

const editorToolbar = ref<HTMLElement | null>(null);
const editorToolbarScroll = ref<HTMLElement | null>(null);
const showToolbarTable = ref<boolean>(false);
const scrollManager = ref<ScrollManager | null>(null);

const scrollSpeed = computed((): number => {
  return smAndDown.value ? 100 : 500;
});

const firstArrowState = computed(() =>
  props.isMobile ? 'showTopArrow' : 'showLeftArrow',
);
const secondArrowState = computed(() =>
  props.isMobile ? 'showBottomArrow' : 'showRightArrow',
);

const scroll = (direction: number) => {
  scrollManager.value?.scroll(direction);
};

const getScrollBtnState = (
  prop: 'showLeftArrow' | 'showRightArrow' | 'showTopArrow' | 'showBottomArrow',
) => {
  return !scrollManager.value?.scrollState[prop] ? 'visibility: hidden;' : '';
};

const handleSuperscript = (command: string) => {
  if (!props.editorInstance) return;

  const editor = props.editorInstance;
  const { from, empty } = editor.state.selection;

  editor.chain().focus()[command]().run();

  if (empty) {
    editor.chain().insertContent('\u200B').run();
    requestAnimationFrame(() => {
      editor.commands.setTextSelection(from + 1);
    });
  }
};

watch(
  () => editorToolbar.value,
  (newValue) => {
    if (newValue) {
      mouseWheelScrollHandler(
        newValue,
        props.isMobile,
        'html-editor__toolbar-wrap',
      );
    }
    if (editorToolbar.value && editorToolbarScroll.value) {
      scrollManager.value = new ScrollManager(
        editorToolbarScroll.value,
        props.isMobile,
      );
      scrollManager.value?.setResize();
    }
  },
);

watch(
  () => props.isReadOnly,
  () => {
    showToolbarTable.value = false;
  },
);

onBeforeUnmount(() => {
  if (scrollManager.value) {
    scrollManager.value.removeResize();
  }
});
</script>

<style scoped lang="scss">
.html-editor__toolbar {
  position: relative;
}

.container-btn-scroll {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.btn-scroll-attachments {
  pointer-events: auto;
  opacity: 0;
  visibility: hidden;
  z-index: 3;
  max-width: 24px !important;
  max-height: 28px !important;
  min-width: 24px !important;
  width: 24px !important;
  height: 24px !important;
  background-color: var(--darkest-border-color, #dde2ea) !important;
  border-radius: 4px !important;
  transition: opacity 0.3s ease;

  &:first-child {
    margin: 0 0 0 8px !important;
  }

  &:last-child {
    margin: 0 8px 0 0 !important;
  }
}

.html-editor__toolbar:hover .btn-scroll-attachments {
  opacity: 1;
  visibility: visible;
}
</style>
