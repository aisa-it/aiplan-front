<template>
  <v-defaults-provider :defaults="overlayDefaults">
    <Teleport to="body" :disabled="!fullscreen">
      <div
        class="editor-tiptap-shell"
        :class="[
          {
            'editor-tiptap-shell--fullscreen': fullscreen,
            'editor-tiptap-shell--resize': canResize,
            'editor-tiptap-shell--mobile': isMobileToolbar,
          },
          fullscreen ? themeClass : undefined,
          classPrevent,
        ]"
        :style="
          isMobileToolbar
            ? { '--editor-mobile-body-height': `${mobileBodyHeight}px` }
            : undefined
        "
      >
        <div
          class="editor-tiptap"
          :class="{
            'editor-tiptap--editable': isEditable,
            'editor-tiptap--dark': theme.current.value.dark,
          }"
        >
          <EditorTipTapToolbar
            v-if="editor && isEditable"
            :editor="editor"
            :disable-images="disableImages"
            :excluded-tabs="excludedTabs"
            :format-sample-active="formatSampleActive"
            :fullscreen="fullscreen"
            :allow-fullscreen="allowFullscreen"
            :mobile="isMobileToolbar"
            :show-headings="showHeadings"
            :enable-anchors="enableAnchors"
            @toggle-format-sample="toggleFormatSample"
            @toggle-fullscreen="toggleFullscreen"
          />

          <div ref="mobileBody" class="editor-tiptap__body">
            <div class="editor-tiptap__content-wrapper">
              <EditorContent
                v-if="editor"
                :id="editorId"
                :editor="editor"
                class="editor-tiptap__editor-content"
                :class="classPrevent"
                @click="handleEditorClick"
                @pointerout="handleEditorPointerOut"
                @pointerover="handleEditorPointerOver"
                @pointerup="applyFormatSample"
              />

              <div v-if="loading" class="editor-tiptap__loading">
                <DefaultLoader size="38" :width="4" />
              </div>
            </div>

            <aside
              v-if="
                editor &&
                !isEditable &&
                !loading &&
                (canEdit ||
                  (showHeadings && headingLinks.length && !isMobileToolbar))
              "
              class="editor-tiptap__readonly-actions"
              :class="{ 'editor-tiptap__readonly-actions--visible': tocOpen }"
            >
              <button
                v-if="canEdit"
                type="button"
                class="editor-tiptap__readonly-button"
                title="Нажмите для редактирования"
                aria-label="Нажмите для редактирования"
                @click="emit('enableEditing')"
              >
                <EditorIcon name="edit" :size="30" />
              </button>
              <div
                v-if="showHeadings && headingLinks.length && !isMobileToolbar"
                class="editor-tiptap__readonly-toc"
              >
                <EditorTableOfContents
                  v-model:open="tocOpen"
                  :links="headingLinks"
                  @select="scrollToHeading"
                />
              </div>
            </aside>
          </div>
        </div>

        <v-btn
          v-if="
            showHeadings &&
            isMobileToolbar &&
            !isEditable &&
            headingLinks.length
          "
          aria-label="Оглавление"
          title="Оглавление"
          icon
          color="primary"
          class="editor-tiptap-shell__toc-fab"
          @click="tocSheetOpen = true"
        >
          <EditorIcon name="headings" :size="24" />
        </v-btn>

        <v-bottom-sheet
          v-if="showHeadings"
          v-model="tocSheetOpen"
          scroll-strategy="none"
          :z-index="fullscreen ? 2700 : undefined"
        >
          <v-card class="editor-tiptap-shell__toc-sheet">
            <v-card-title>Оглавление</v-card-title>
            <v-divider />
            <v-list class="editor-tiptap-shell__toc-sheet-list">
              <v-list-item
                title="В начало документа"
                @click="selectTocSheetTarget('top')"
              />
              <v-divider class="my-1" />
              <v-list-item
                v-for="link in headingLinks"
                :key="link.id"
                :style="{
                  paddingInlineStart: `${16 + (link.level - 1) * 30}px`,
                }"
                :title="`${/^\d/.test(link.text.trim()) ? '' : `${link.index} `}${link.text}`"
                @click="selectTocSheetTarget(link)"
              />
              <v-divider class="my-1" />
              <v-list-item
                title="К комментариям"
                @click="selectTocSheetTarget('comments')"
              />
            </v-list>
          </v-card>
        </v-bottom-sheet>

        <div
          v-if="isEditable && showActions"
          class="editor-tiptap-shell__actions"
        >
          <v-btn
            :disabled="saving"
            width="110"
            height="32"
            variant="outlined"
            class="editor-tiptap-shell__action"
            @click="emit('cancel')"
            >Отмена</v-btn
          >
          <v-btn
            :loading="saving"
            width="110"
            height="32"
            color="primary"
            variant="flat"
            class="editor-tiptap-shell__action"
            @click="handleSave"
            >Сохранить</v-btn
          >
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <UserAvatarMenu
        v-if="mentionPreviewAnchor && mentionPreviewItem"
        v-model="mentionMenuOpen"
        :target="mentionPreviewAnchor"
        :user="mentionPreviewItem"
        no-hat
        @content-pointerenter="cancelMentionPreviewClose"
        @content-pointerleave="scheduleMentionPreviewClose"
      />
    </Teleport>

    <EditorImagePreview
      v-if="previewImageSrc"
      v-model="imagePreviewOpen"
      :alt="previewImageAlt"
      :src="previewImageSrc"
      :is-diagram="previewImageIsDiagram"
    />
    <EditorCommentPreviewDialog
      v-if="previewCommentLink"
      v-model="commentPreviewOpen"
      :link="previewCommentLink"
    />
  </v-defaults-provider>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, watch } from 'vue';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorContent, type Editor } from '@tiptap/vue-3';
import { useDisplay, useTheme } from 'vuetify';

import DefaultLoader from '@/components/loaders/DefaultLoader.vue';
import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';
import { useEditorFormatSample } from '../composables/useEditorFormatSample';
import { useEditorFloatingTableScroll } from '../composables/useEditorFloatingTableScroll';
import { useEditorHeadings } from '../composables/useEditorHeadings';
import { useEditorInstance } from '../composables/useEditorInstance';
import { useEditorMentions } from '../composables/useEditorMentions';
import { createEditorExtensions } from '../extensions/createEditorExtensions';
import {
  EDITOR_ANCHOR_CONTEXT_KEY,
  EDITOR_READONLY_KEY,
  EDITOR_SPECIAL_LINK_RESOLVERS_KEY,
} from '../model/editor.injection';
import type {
  EditorHeadingLink,
  EditorSpecialLink,
  EditorTipTapProps,
} from '../model/editor.types';
import { normalizeEditorContent } from '../utils/normalizeEditorContent';
import { collectEditorHeadingLinks } from '../utils/editorHeadingLinks';
import { applyEditorTheme } from '../utils/applyEditorTheme';
import {
  getEditorSpecialLinkFromElement,
  getSafeEditorLinkHref,
} from '../utils/editorSpecialLinks';
import EditorIcon from './EditorIcon.vue';
import EditorCommentPreviewDialog from './EditorCommentPreviewDialog.vue';
import EditorImagePreview from './EditorImagePreview.vue';
import {
  parseEditorAnchorHref,
  scrollEditorToAnchor,
  type ScrollEditorToAnchorOptions,
} from '../utils/editorAnchorNavigation';
import EditorTableOfContents from './EditorTableOfContents.vue';
import EditorTipTapToolbar from './EditorTipTapToolbar.vue';
import {
  downloadEditorAttachment,
  resolveEditorAttachmentLink,
  resolveEditorIssueLink,
} from '../utils/editorIntegration';

const props = withDefaults(defineProps<EditorTipTapProps>(), {
  modelValue: '',
  editable: true,
  canEdit: true,
  disableImages: false,
  loading: false,
  saving: false,
  showActions: true,
  placeholder: 'Описание',
  showHeadings: false,
  enableAnchors: false,
  fullscreen: false,
  readOnlyEditor: false,
  canResize: false,
  excludedTabs: () => [],
  classPrevent: '',
  allowFullscreen: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'update:fullscreen': [value: boolean];
  save: [];
  cancel: [];
  enableEditing: [];
  specialLinkClick: [link: EditorSpecialLink, event: MouseEvent];
  getEditor: [editor: Editor | null];
  updateEditorDOM: [document: ProseMirrorNode];
}>();

const theme = useTheme();
const display = useDisplay();
const isMobilePlatform =
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
const isMobileToolbar = computed(
  () => isMobilePlatform && display.width.value < 1024,
);
const mobileBody = ref<HTMLElement>();
const mobileBodyHeight = ref(240);
let mobileBodyObserver: ResizeObserver | undefined;
watch(
  [mobileBody, isMobileToolbar],
  ([body, mobile]) => {
    mobileBodyObserver?.disconnect();
    mobileBodyObserver = undefined;
    if (!body || !mobile) return;
    mobileBodyObserver = new ResizeObserver(([entry]) => {
      if (entry)
        mobileBodyHeight.value = Math.max(
          240,
          Math.ceil(entry.contentRect.height),
        );
    });
    mobileBodyObserver.observe(body);
  },
  { immediate: true },
);
const themeClass = computed(() => `v-theme--${theme.global.name.value}`);

const overlayDefaults = computed(() => ({
  VMenu: {
    contentClass: props.classPrevent || undefined,
    ...(props.fullscreen ? { zIndex: 2600 } : {}),
  },
  VDialog: {
    contentClass: props.classPrevent || undefined,
    ...(props.fullscreen ? { zIndex: 2600 } : {}),
  },
  ...(props.fullscreen ? { VTooltip: { zIndex: 2700 } } : {}),
}));
const isEditable = computed(
  () =>
    props.canEdit && props.editable && !props.readOnlyEditor && !props.loading,
);
const isReadonly = computed(() => !isEditable.value);
const tocOpen = ref(false);
const tocSheetOpen = ref(false);
const pendingTocTarget = ref<'top' | 'comments' | EditorHeadingLink | null>(
  null,
);
const imagePreviewOpen = ref(false);
const previewImageAlt = ref('');
const previewImageSrc = ref('');
const previewImageIsDiagram = ref(false);
const commentPreviewOpen = ref(false);
const previewCommentLink = ref<EditorSpecialLink>();
let previousBodyOverflow: string | undefined;

provide(EDITOR_READONLY_KEY, isReadonly);
provide(
  EDITOR_ANCHOR_CONTEXT_KEY,
  computed(() => ({
    workspaceSlug: props.workspaceSlug,
    documentSlug: props.documentSlug,
  })),
);
provide(EDITOR_SPECIAL_LINK_RESOLVERS_KEY, {
  get resolveIssueLink() {
    return props.resolveIssueLink ?? resolveEditorIssueLink;
  },
  get resolveAttachmentLink() {
    return props.resolveAttachmentLink ?? resolveEditorAttachmentLink;
  },
});

const {
  mention,
  mentionPreviewAnchor,
  mentionPreviewItem,
  mentionMenuOpen,
  cancelMentionPreviewClose,
  scheduleMentionPreviewClose,
  closeMentionPreview,
  handleEditorPointerOver,
  handleEditorPointerOut,
} = useEditorMentions(props);
const handleEditorClick = (event: MouseEvent) => {
  if (props.loading) return;
  if (props.enableAnchors) {
    const link = (
      event.target as HTMLElement | null
    )?.closest<HTMLAnchorElement>('a[href]');
    const parsed =
      link && parseEditorAnchorHref(link.getAttribute('href') || '');
    if (parsed) {
      const sameDocument =
        !parsed.documentSlug ||
        (parsed.workspaceSlug === props.workspaceSlug &&
          parsed.documentSlug === props.documentSlug);
      if (sameDocument) {
        event.preventDefault();
        scrollEditorToAnchor(editor.value, parsed.anchorId);
      } else if (isEditable.value) {
        event.preventDefault();
      } else if (
        props.navigateToDocumentAnchor &&
        parsed.workspaceSlug &&
        parsed.documentSlug
      ) {
        event.preventDefault();
        props.navigateToDocumentAnchor({
          workspaceSlug: parsed.workspaceSlug,
          documentSlug: parsed.documentSlug,
          anchorId: parsed.anchorId,
        });
      } else if (link && link.origin !== window.location.origin) {
        event.preventDefault();
        window.location.assign(`${link.pathname}${link.search}${link.hash}`);
      }
      return;
    }
  }
  const image = (event.target as HTMLElement | null)?.closest<HTMLImageElement>(
    'img',
  );
  if (image && !isEditable.value) {
    const src = image.dataset.asset || image.currentSrc || image.src;
    if (!src) return;

    event.preventDefault();
    previewImageSrc.value = src;
    previewImageAlt.value = image.alt;
    previewImageIsDiagram.value = image.dataset.drawio === 'true';
    imagePreviewOpen.value = true;
    return;
  }

  const specialLinkElement = (
    event.target as HTMLElement | null
  )?.closest<HTMLElement>('.special-link-mention');
  if (!specialLinkElement) return;

  const specialLink = getEditorSpecialLinkFromElement(specialLinkElement);
  if (!specialLink) return;

  emit('specialLinkClick', specialLink, event);

  if (
    specialLink.kind === 'comment' &&
    !isEditable.value &&
    !event.defaultPrevented
  ) {
    event.preventDefault();
    previewCommentLink.value = specialLink;
    commentPreviewOpen.value = true;
    return;
  }

  if (specialLink.kind === 'attachment' && !event.defaultPrevented) {
    event.preventDefault();
    void downloadEditorAttachment(specialLink).catch(() => {});
    return;
  }

  const href = getSafeEditorLinkHref(specialLink.originalUrl);
  if (
    (specialLink.kind === 'issue' || !isEditable.value) &&
    !event.defaultPrevented &&
    href
  ) {
    window.open(href, '_blank', 'noopener,noreferrer');
  }
};

const { editor } = useEditorInstance({
  content: () => props.modelValue,
  normalizeContent: (html) =>
    normalizeEditorContent(html, theme.current.value.dark ? 'dark' : 'light'),
  editable: () => isEditable.value,
  extensions: () =>
    createEditorExtensions({
      allowImages: !props.disableImages,
      enableAnchors: props.enableAnchors,
      mention,
      placeholder: props.placeholder,
    }),
  onUpdate: (html) => emit('update:modelValue', html),
});
useEditorFloatingTableScroll(editor);

watch(
  () => theme.current.value.dark,
  (dark) => {
    if (editor.value) applyEditorTheme(editor.value, dark ? 'dark' : 'light');
  },
);

const {
  active: formatSampleActive,
  apply: applyFormatSample,
  clear: clearFormatSample,
  toggle: toggleFormatSample,
} = useEditorFormatSample(editor);
const { links: headingLinks, scrollTo: scrollToHeading } =
  useEditorHeadings(editor);

const selectTocSheetTarget = (
  target: 'top' | 'comments' | EditorHeadingLink,
) => {
  pendingTocTarget.value = target;
  tocSheetOpen.value = false;
};

watch(tocSheetOpen, async (open) => {
  if (open || !pendingTocTarget.value) return;
  await nextTick();
  requestAnimationFrame(() => {
    const target = pendingTocTarget.value;
    pendingTocTarget.value = null;
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'comments') {
      if (props.scrollToComments) props.scrollToComments();
      else {
        const comments = document.querySelector<HTMLElement>(
          '.issue-panel__comments-card',
        );
        if (comments) {
          comments.style.scrollMarginTop = '60px';
          comments.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          });
      }
    } else if (target) scrollToHeading(target);
  });
});

watch(editor, (currentEditor, _, onCleanup) => {
  emit('getEditor', currentEditor);
  if (!currentEditor) return;
  const reportDocument = () => emit('updateEditorDOM', currentEditor.state.doc);
  currentEditor.on('update', reportDocument);
  reportDocument();
  onCleanup(() => currentEditor.off('update', reportDocument));
});

const updateToC = () => {
  const currentEditor = editor.value;
  if (!currentEditor) return;
  const transaction = currentEditor.state.tr;
  const serialized = JSON.stringify(collectEditorHeadingLinks(transaction));
  transaction.doc.descendants((node, position) => {
    if (node.type.name === 'heading-links' && node.attrs.links !== serialized) {
      transaction.setNodeMarkup(position, undefined, {
        ...node.attrs,
        links: serialized,
      });
    }
  });
  if (transaction.docChanged) currentEditor.view.dispatch(transaction);
};

const scrollToAnchor = (
  anchorId: string,
  options?: ScrollEditorToAnchorOptions,
) => scrollEditorToAnchor(editor.value, anchorId, options);

const handleSave = () => {
  updateToC();
  emit('save');
};

const toggleFullscreen = () => {
  emit('update:fullscreen', !props.fullscreen);
};

watch(isEditable, (editable) => {
  if (!editable) clearFormatSample();
  if (editable) closeMentionPreview();
  if (editable) tocSheetOpen.value = false;
});

watch(imagePreviewOpen, (open) => {
  if (open) return;

  previewImageAlt.value = '';
  previewImageSrc.value = '';
  previewImageIsDiagram.value = false;
});
watch(commentPreviewOpen, (open) => {
  if (!open) previewCommentLink.value = undefined;
});

watch(
  () => props.fullscreen,
  (fullscreen) => {
    if (fullscreen) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return;
    }

    if (previousBodyOverflow !== undefined) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = undefined;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  mobileBodyObserver?.disconnect();
  if (previousBodyOverflow !== undefined) {
    document.body.style.overflow = previousBodyOverflow;
  }
});

defineExpose({
  editor,
  updateToC,
  scrollToAnchor,
});
</script>

<style scoped src="./EditorTipTap.scss"></style>

<style>
.editor-mention-popup {
  position: fixed;
  z-index: 3000;
}
</style>
