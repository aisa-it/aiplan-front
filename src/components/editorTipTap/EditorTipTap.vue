<template>
  <div
    v-if="editorInstance"
    ref="editorRootRef"
    :class="[
      'html-editor',
      { 'html-editor--mobile': isMobile, classPrevent: classPrevent },
    ]"
    :style="{ flexDirection: isMobile && !isReadOnly ? 'row' : 'column' }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <EditorTipTapToolbar
      v-if="!isReadOnly"
      :editorInstance="editorInstance"
      :is-read-only="isReadOnly"
      :is-format-sample-active="isFormatSampleActive"
      :classPrevent="classPrevent"
      :disableImages="disableImages"
      :isMobile="isMobile"
      :style="{ height: isMobile ? `${editorToolbarHeight}px` : 'auto' }"
      :isFullScreen="isFullScreenView"
      :showHeadings="showHeadings"
      @toggle-format-sample="isFormatSampleActive = !isFormatSampleActive"
      @enable-editing="emits('enableEditing')"
      @toggle-fullscreen="emits('toggle-fullscreen')"
    />

    <div class="html-editor__outer">
      <EditorEditButton
        v-if="canEdit && isReadOnly"
        :visible="isShowEdit"
        :show-headings="showHeadings"
        :toc-links="tocLinks"
        v-model:is-toc-popup-open="isTocPopupOpen"
        :class-prevent="classPrevent"
        @enable-editing="emits('enableEditing')"
        @toc-click="onTocItemClick"
      />

      <div class="html-editor__wrapper">
        <div v-if="loading" class="html-editor__loading-overlay" />
        <EditorContent
          :id="editorId"
          :key="editorKey"
          :editor="editorInstance"
          :class="[
            'html-editor__container',
            {
              'html-editor__readonly': isReadOnly,
              'html-editor__scroll-visible': isReadOnly,
              'html-editor__resize': canResize,
            },
            classPrevent,
          ]"
        />
        <EditorTooltipMention
          :content="tooltipContentMention"
          :anchor="tooltipAnchorMention"
          :show-tooltip="isTooltipMention"
          :class-prevent="classPrevent"
          @showTooltip="hideMentionTooltip"
        />
      </div>
    </div>

    <EditorAnchorDialog
      v-model="editAnchor"
      :editor-instance="editorInstance"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, provide, ref } from 'vue';
import { EditorContent } from '@tiptap/vue-3';
import EditorTipTapToolbar from './components/EditorTipTapToolbar.vue';
import EditorEditButton from './components/EditorEditButton.vue';
import EditorAnchorDialog from './components/EditorAnchorDialog.vue';
import EditorTooltipMention from './components/EditorTooltipMention.vue';
import { useEditorInstance } from './composables/useEditorInstance';
import { useEditorMobileLayout } from './composables/useEditorMobileLayout';
import { useEditorToc } from './composables/useEditorToc';
import { useMentionTooltip } from './composables/useMentionTooltip';
import { useFloatScroll } from './composables/useFloatScroll';
import {
  createEditorEventBus,
  type EditorEventBus,
} from './utils/eventBus';

const props = withDefaults(
  defineProps<{
    editorId: string;
    modelValue: string;
    readOnlyEditor?: boolean;
    canEdit?: boolean;
    editorPlaceholder?: string;
    isMention?: boolean;
    canResize?: boolean;
    loading?: boolean;
    isCodeBlockLowlight?: boolean;
    classPrevent?: string;
    members?: Record<string, any>[];
    getMembersForMention?: (search: string) => Promise<Array<unknown> | void>;
    disableImages?: boolean;
    isFullScreen?: boolean;
    isFullScreenView?: boolean;
    showHeadings?: boolean;
  }>(),
  {
    modelValue: '',
    readOnlyEditor: false,
    canEdit: true,
    editorPlaceholder: 'Описание',
    isMention: false,
    canResize: false,
    loading: false,
    isCodeBlockLowlight: true,
    classPrevent: '',
    disableImages: false,
    isFullScreen: false,
    isFullScreenView: false,
    showHeadings: false,
  },
);

const emits = defineEmits<{
  'update:modelValue': [string];
  getEditor: [unknown];
  enableEditing: [];
  'toggle-fullscreen': [];
  updateEditorDOM: [unknown];
}>();

const injectedBus = inject<EditorEventBus | undefined>('bus', undefined);
const bus = injectedBus ?? createEditorEventBus();
provide('bus', bus);

const isReadOnly = computed(() => !props.canEdit || props.readOnlyEditor);
provide('isEditorReadOnly', isReadOnly);

const isFormatSampleActive = ref(false);
const isShowEdit = ref(false);
const editAnchor = ref(false);
const editorKey = computed(
  () => props.editorId + (props.readOnlyEditor ? 'readonly' : ''),
);

const { isMobile, editorRootRef, editorToolbarHeight } =
  useEditorMobileLayout();

const mention = useMentionTooltip({
  isMention: () => props.isMention,
  members: () => props.members,
});
const {
  isTooltipMention,
  tooltipAnchorMention,
  tooltipContentMention,
  hide: hideMentionTooltip,
} = mention;

const onCommentLink = (commentData: any) => {
  if (isReadOnly.value) {
    if (commentData) bus.emits('openSingleComment', commentData);
    return;
  }
  editAnchor.value = true;
};

const { editorInstance } = useEditorInstance({
  props,
  isReadOnly,
  isFormatSampleActive,
  onCommentLink,
  onEditorChange: () => {
    refreshTocLinks();
    floatScroll();
  },
  emitUpdate: (html) => emits('update:modelValue', html),
  emitDom: (doc) => emits('updateEditorDOM', doc),
  emitEditor: (editor) => emits('getEditor', editor),
});

const { floatScroll, clearFloatScroll } = useFloatScroll(editorInstance);
const {
  tocLinks,
  isTocPopupOpen,
  refreshTocLinks,
  onTocItemClick,
  updateToC,
} = useEditorToc(editorInstance, computed(() => props.showHeadings));

const onMouseMove = (event: MouseEvent) => {
  mention.onMove(event);
  if (props.canEdit && props.readOnlyEditor) isShowEdit.value = true;
};

const onMouseLeave = (event: MouseEvent) => {
  mention.onLeave(event);
  if (!isTocPopupOpen.value) isShowEdit.value = false;
};

onBeforeUnmount(clearFloatScroll);

defineExpose({ updateToC });
</script>
