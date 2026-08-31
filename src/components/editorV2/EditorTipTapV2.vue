<template>
  <div
    v-if="editorInstance"
    :class="[
      'html-editor',
      { 'html-editor--mobile': isMobile, classPrevent: classPrevent },
    ]"
    :style="{ flexDirection: isMobile && !isReadOnly ? 'row' : 'column' }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <EditorTipTapToolbar
      v-if="!isReadOnly"
      :editorInstance="editorInstance"
      :excluded-tabs="excludedTabs"
      :is-read-only="isReadOnly"
      :is-format-sample-active="isFormatSampleActive"
      :classPrevent="classPrevent"
      :disableImages="disableImages"
      :is-editor-v2="true"
      :isMobile="isMobile"
      :style="{ height: isMobile ? `${editorToolbarHeight}px` : 'auto' }"
      :isFullScreen="isFullScreenView"
      :showHeadings="props.showHeadings"
      :enableAnchors="props.enableAnchors"
      @toggle-format-sample="isFormatSampleActive = !isFormatSampleActive"
      @enable-editing="emits('enableEditing')"
      @toggle-fullscreen="emits('toggle-fullscreen')"
    />

    <div class="html-editor__outer">
      <transition name="fade">
        <span
          v-if="canEdit && isReadOnly"
          :class="[
            'html-editor__btn-edit',
            classPrevent,
            { 'html-editor__btn-edit--force': isShowEdit || isTocPopupOpen },
          ]"
          title="Нажмите для редактирования"
          @click="emits('enableEditing')"
        >
          <EditIcon />

          <q-btn
            v-if="props.showHeadings && tocLinks.length"
            dense
            flat
            padding="0"
            :class="`html-editor__btn-toc ${classPrevent}`"
            title="Оглавление"
            @click.stop
          >
            <component :is="ICONS.headingsIcon" />
            <q-popup-proxy
              ref="tocPopupRef"
              v-model="isTocPopupOpen"
              class="hide-scrollbar"
              :offset="[-10, 0]"
            >
              <q-card style="max-width: 360px; max-height: 300px">
                <q-card-section class="text-subtitle2 q-pb-sm">
                  Оглавление
                </q-card-section>

                <q-separator />

                <q-card-section class="q-pt-sm q-pb-sm">
                  <div v-for="link in tocLinks" :key="link.id">
                    <a
                      v-close-popup
                      :href="`#${link.anchorId || link.id}`"
                      :style="
                        'padding-left:' + `${30 * (link.originalLevel - 1)}px`
                      "
                      class="html-editor__toc-link"
                      @click.prevent="onTocItemClick(link)"
                    >
                      {{ !hasOwnNumeration(link.text) ? link.index + ' ' : ''
                      }}{{ link.text }}
                    </a>
                  </div>
                </q-card-section>
              </q-card>
            </q-popup-proxy>
          </q-btn>
        </span>
      </transition>

      <div class="html-editor__wrapper">
        <div v-if="loading" class="html-editor__loading-overlay" />
        <DefaultLoader v-if="loading" class="html-editor__loader" />
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
          @click="handleClickEditor"
        />
        <EditorTooltipMention
          :content="tooltipContentMention"
          :anchor="tooltipAnchorMention"
          :show-tooltip="isTooltipMention"
          :class-prevent="classPrevent"
          @showTooltip="isTooltipMention = false"
        />
        <q-resize-observer v-if="isMobile" @resize="onResize" />
      </div>
    </div>

    <!-- Мобильная навигация по длинному документу: кнопка hover-оглавления
         на тач-устройствах недоступна, поэтому дублируем его шторкой снизу -->
    <template v-if="props.showHeadings">
      <q-btn
        v-if="isMobile && isReadOnly && tocLinks.length"
        round
        unelevated
        class="html-editor__toc-fab"
        title="Оглавление"
        @click="isTocSheetOpen = true"
      >
        <component :is="ICONS.headingsIcon" />
      </q-btn>

      <!-- Диалог не под летучими условиями (isMobile/isReadOnly/tocLinks)
           намеренно: v-if, снятый при открытой модалке (поворот экрана,
           переход в правку), размонтирует её и оставит body с
           q-body--prevent-scroll — страница перестанет скроллиться.
           Закрытый q-dialog ничего не рендерит, держать его смонтированным
           бесплатно. -->
      <q-dialog
        v-model="isTocSheetOpen"
        position="bottom"
        class="html-editor__toc-sheet-dialog"
        @hide="onTocSheetHide"
      >
        <q-card class="html-editor__toc-sheet">
          <q-card-section class="text-subtitle2 q-pb-sm">
            Оглавление
          </q-card-section>

          <q-separator />

          <q-card-section class="html-editor__toc-sheet-list q-pt-sm q-pb-sm">
            <a
              href="#"
              class="html-editor__toc-link"
              @click.prevent="onTocSheetItemClick('top')"
            >
              В начало документа
            </a>

            <q-separator class="q-my-xs" />

            <div v-for="link in tocLinks" :key="link.id">
              <a
                :href="`#${link.anchorId || link.id}`"
                :style="'padding-left:' + `${30 * (link.originalLevel - 1)}px`"
                class="html-editor__toc-link"
                @click.prevent="onTocSheetItemClick(link)"
              >
                {{ !hasOwnNumeration(link.text) ? link.index + ' ' : ''
                }}{{ link.text }}
              </a>
            </div>

            <q-separator class="q-my-xs" />

            <a
              href="#"
              class="html-editor__toc-link"
              @click.prevent="onTocSheetItemClick('comments')"
            >
              К комментариям
            </a>
          </q-card-section>
        </q-card>
      </q-dialog>
    </template>

    <DocPreviewDialog
      v-if="openImage"
      v-model="openImage"
      :file="image"
      :isDiagram="isOpenDiagram"
    />
    <EditorCommentLinkTitleDialog
      v-model="editAnchor"
      :editor-instance="editorInstance"
    />
  </div>
</template>

<script setup lang="ts">
// Vue
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  provide,
  inject,
  nextTick,
} from 'vue';
import { useQuasar, Screen, EventBus } from 'quasar';

// TipTap
import { Editor, EditorContent } from '@tiptap/vue-3';
import { generateHeadingLinks } from 'src/utils/tableOfContents';

// Components
import EditIcon from '../icons/EditIcon.vue';
import DocPreviewDialog from '../dialogs/DocPreviewDialog.vue';
import EditorTipTapToolbar from './components/EditorTipTapToolbar.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import { getEditorExtensions } from 'src/components/editorV2/extensions/extensionConfigure/extensions';
import {
  getEditorProps,
  useHandleMouseUp,
  replaceColor,
} from './utils/editorUtils';
import EditorCommentLinkTitleDialog from './components/EditorCommentLinkTitleDialog.vue';
import EditorTooltipMention from './components/EditorTooltipMention.vue';
import aiplan from 'src/utils/aiplan';
import { useRoute, useRouter } from 'vue-router';
import {
  scrollToAnchorId,
  scrollToAnchorElement,
} from 'src/utils/scrollToAnchor';
import { ICONS } from 'src/utils/icons';
import { useMenuHandler } from 'src/composables/useMenuHandler';
import { useFloatScroll } from './composables/useFloatScroll';

// Interfaces
interface IEditorV2Props {
  editorId: string;
  modelValue: string;
  readOnlyEditor?: boolean;
  canEdit?: boolean;
  editorPlaceholder?: string;
  isMention?: boolean;
  excludedTabs?: string[];
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
  enableAnchors?: boolean;
}

interface ContentMention {
  avatar?: string;
  username?: string;
  email?: string;
  avatarText?: string;
  title?: string;
}

// Props
const props = withDefaults(defineProps<IEditorV2Props>(), {
  modelValue: '',
  readOnlyEditor: false,
  canEdit: true,
  editorPlaceholder: 'Описание',
  isMention: false,
  canResize: false,
  loading: false,
  isCodeBlockLowlight: true,
  classPrevent: '',
  members: undefined,
  getMembersForMention: undefined,
  disableImages: false,
  isFullScreen: false,
  isFullScreenView: false,
  showHeadings: false,
  enableAnchors: false,
  excludedTabs: undefined,
});

// Emits
const emits = defineEmits<{
  'update:modelValue': [string];
  getEditor: [Editor | null];
  enableEditing: [];
  'toggle-fullscreen': [];
  updateEditorDOM: [any];
}>();

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const bus = inject<EventBus>('bus');
const editorInstance = ref<Editor | null>(null);
const isFormatSampleActive = ref<boolean>(false);
const editorToolbarHeight = ref<number>(0);
const openImage = ref<boolean>(false);
const image = ref<Record<string, any>>({ asset: '' });
const editAnchor = ref<boolean>(false);
const editorKey = ref<string>(
  props.editorId + props.readOnlyEditor ? 'readonly' : '',
);
const tocLinks = ref([]);

// mentions
const isTooltipMention = ref<boolean>(false);
const tooltipAnchorMention = ref<HTMLElement>();
const tooltipContentMention = ref<ContentMention>({});
const isShowEdit = ref<boolean>(false);
const isOpenDiagram = ref<boolean>(false);
const isTocPopupOpen = ref<boolean>(false);
const tocPopupRef = ref();
const isTocSheetOpen = ref<boolean>(false);
const pendingTocTarget = ref<null | 'top' | (typeof tocLinks.value)[number]>(
  null,
);

useMenuHandler(tocPopupRef);
const { floatScroll, clearFloatScroll } = useFloatScroll(editorInstance);

const isMobile = computed(() => $q.platform.is.mobile && Screen.lt.md);
const isReadOnly = computed(() => !props.canEdit || props.readOnlyEditor);
provide('isEditorReadOnly', isReadOnly);
const editorExtensions = computed(() =>
  getEditorExtensions(props, (items: unknown[]) => {
    tocLinks.value = generateHeadingLinks(items || []);
  }),
);

const hasOwnNumeration = (heading: string) => {
  const firstChar = heading[0];
  return /\d/.test(firstChar);
};

// Попап с информацией о пользователе при наведении
const handleMouseMove = (e: any) => {
  const isMention = e.target.dataset.type === 'mention' && props.isMention;
  if (isMention) {
    handleMouseEnter(e);
  } else {
    tooltipContentMention.value = {};
    tooltipAnchorMention.value = undefined;
    isTooltipMention.value = false;
  }

  if (props.canEdit && props.readOnlyEditor) {
    isShowEdit.value = true;
  }
};

const handleMouseLeave = (e: any) => {
  if (e?.toElement?.className !== 'mention-popup') {
    isTooltipMention.value = false;
  }

  if (!isTocPopupOpen.value) {
    isShowEdit.value = false;
  }
};

const handleMember = (member: any, isUserName?: boolean): string => {
  if (isUserName) {
    return aiplan.UserName(member).join(' ');
  }

  return aiplan
    .UserName(member)
    .map((m) => m[0])
    .join(' ');
};

const handleMouseEnter = (event: any) => {
  const userName = event.target.getAttribute('data-label');
  const user = props.members?.find(
    (u) => u.member?.username === userName || u.member?.email === userName,
  );

  if (user) {
    tooltipContentMention.value = {
      avatar: user.member.avatar_id,
      title: handleMember(user.member, true),
      avatarText: handleMember(user.member),
      email: user.member.email,
    };

    isTooltipMention.value = true;
  }

  tooltipAnchorMention.value = event.target;
};

function createEditor() {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }

  editorInstance.value = new Editor({
    content: props.modelValue.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;'),
    editable: !isReadOnly.value,
    extensions: editorExtensions.value as any,
    onUpdate: () => {
      emits('update:modelValue', editorInstance.value?.getHTML());
      emits('updateEditorDOM', editorInstance.value?.state.doc);
      refreshTocLinks();
      floatScroll();
    },
    onCreate: () => {
      emits('updateEditorDOM', editorInstance.value?.state.doc);
      refreshTocLinks();
      floatScroll();
    },
    editorProps: getEditorProps(editorInstance, onCommentLink, onAnchorLink),
    classPrevent: props.classPrevent,
  } as any);
  const { addMouseUpListener } = useHandleMouseUp(
    editorInstance as any,
    isFormatSampleActive,
  );
  addMouseUpListener();
  emits('getEditor', editorInstance.value);
}

const refreshTocLinks = () => {
  if (!props.showHeadings || !editorInstance.value) {
    tocLinks.value = [];
    return;
  }

  const items =
    editorInstance.value.extensionStorage?.tableOfContents?.content || [];
  tocLinks.value = generateHeadingLinks(items);
};

const onTocItemClick = (link: (typeof tocLinks.value)[number]) => {
  const editor = editorInstance.value;
  if (!editor) return;

  // Сначала постоянный id заголовка, и лишь потом служебный runtime-id
  // расширения table-of-contents (нужен для документов без проставленных id).
  if (
    link.anchorId &&
    scrollToAnchorId(editor, link.anchorId, { focus: true })
  ) {
    return;
  }

  const element = editor.view.dom.querySelector(`[data-toc-id="${link.id}"]`);
  if (element) scrollToAnchorElement(editor, element, { focus: true });
};

// Переход выполняем после закрытия шторки: q-dialog блокирует скролл body
// и при закрытии возвращает его на сохранённую позицию — прыжок до @hide
// был бы молча откатан.
const onTocSheetItemClick = (
  target: 'top' | 'comments' | (typeof tocLinks.value)[number],
) => {
  pendingTocTarget.value = target;
  isTocSheetOpen.value = false;
};

const onTocSheetHide = () => {
  const target = pendingTocTarget.value;
  pendingTocTarget.value = null;
  if (!target) return;

  if (target === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (target === 'comments') {
    // Блок «Активность» живёт на странице, а не в редакторе, поэтому ищем
    // по классу карточки; без него (редактор вне АИДока) едем в конец.
    const comments = document.querySelector(
      '.issue-panel__comments-card',
    ) as HTMLElement | null;
    if (comments) {
      comments.style.scrollMarginTop = '60px';
      comments.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
    return;
  }

  onTocItemClick(target);
};

/**
 * Переход по ссылке с якорем. Внутри текущего документа — просто скролл,
 * на другой документ — навигация роутером с хэшем (дальше подхватит AiDocPage).
 */
const onAnchorLink = (
  parsed: { slug?: string; docId?: string; anchorId: string },
  href: string,
) => {
  const isOtherDoc = !!parsed.docId && parsed.docId !== route.params.doc;

  if (isOtherDoc) {
    router.push(`/${parsed.slug}/aidoc/${parsed.docId}#${parsed.anchorId}`);
    return;
  }

  if (
    !scrollToAnchorId(editorInstance.value, parsed.anchorId, {
      highlight: true,
    })
  ) {
    // Якорь удалили, а ссылка на него осталась — молча никуда не прыгаем.
    console.warn('Якорь не найден в документе:', href);
  }
};

/** Переход к якорю извне (например, по хэшу в адресной строке). */
const scrollToAnchor = (
  anchorId: string,
  options: Parameters<typeof scrollToAnchorId>[2] = {},
) =>
  scrollToAnchorId(editorInstance.value, anchorId, {
    highlight: true,
    ...options,
  });

function handleClickEditor(e: MouseEvent | TouchEvent) {
  const target = e.target as HTMLElement;
  if (target.tagName === 'IMG' && props.readOnlyEditor) {
    e.preventDefault();
    const asset = target.dataset.asset;

    isOpenDiagram.value = !!target.dataset.drawio;

    if (asset) {
      image.value.asset = asset;
      openImage.value = true;
    }
  }
}

const onResize = (size: any) => {
  if (isMobile.value) editorToolbarHeight.value = size.height;
};

const onCommentLink = (commentData: any) => {
  if (isReadOnly.value) {
    if (commentData) bus?.emit('openSingleComment', commentData);
  } else {
    editAnchor.value = true;
  }
};

const updateToC = () => {
  if (!editorInstance.value) return;
  const { state } = editorInstance.value;
  const { tr, doc } = state;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading-links') {
      const newAttrs = {
        ...node.attrs,
        links: generateHeadingLinks(
          editorInstance.value.extensionStorage.tableOfContents.content,
        ),
      };
      const newNode = node.type.create(newAttrs, node.content, node.marks);

      if (newNode && newNode.type) {
        tr.replaceRangeWith(pos, pos + node.nodeSize, newNode);
      }
    }
  });

  if (tr.docChanged) {
    editorInstance.value.view.dispatch(tr);
  }
};

watch(
  () => isReadOnly.value,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      const scrollY = window.scrollY;
      editorInstance.value.setOptions({ editable: true });
      nextTick(() => window.scrollTo({ top: scrollY }));
    } else {
      editorInstance.value.setOptions({ editable: !newVal });
    }
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    newVal = newVal.replaceAll('\t', '&nbsp;&nbsp;&nbsp;&nbsp;');
    if (editorInstance.value && newVal !== editorInstance.value.getHTML()) {
      let content = replaceColor(newVal, $q.dark.isActive ? 'dark' : 'light');
      editorInstance.value.commands.setContent(content, { emitUpdate: false });
      refreshTocLinks();
    }
  },
);

onMounted(() => createEditor());

onBeforeUnmount(() => {
  clearFloatScroll();
  editorInstance.value?.destroy();
});

defineExpose({
  updateToC,
  scrollToAnchor,
});
</script>

<style scoped lang="scss">
.html-editor {
  // overflow-y: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__toolbar {
    overflow: hidden;
    position: sticky;
    flex-shrink: 0;
    top: 0;
    z-index: 10;
    background-color: $bg-color;
  }

  &__outer {
    display: flex;
    flex-direction: row-reverse;
    align-items: stretch;
  }

  &__btn-edit {
    display: flex;
    width: 34px;
    box-sizing: border-box;
    padding: 6px 0;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    cursor: pointer;
    background-color: $bg-color;
    border-radius: 0 8px 8px 0;
    border-left: 1px solid $dark-border-color;
    position: sticky;
    top: 50px;
    z-index: 10;
    visibility: hidden;
  }

  &__btn-edit--force {
    visibility: visible;
  }

  &__btn-toc {
    width: 28px;
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    padding: 0;
    cursor: pointer;
    border-radius: 6px;
    position: sticky;
    top: 86px;
    z-index: 10;
  }

  &__btn-toc :deep(.q-btn__content) {
    padding: 0;
  }

  &__btn-edit svg {
    overflow: hidden;
    position: sticky;
    top: 50px;
    right: 0;
    width: 30px;
    flex-shrink: 0;
    height: 30px;
    z-index: 10;
  }

  &__btn-toc svg {
    width: 22px;
    height: 22px;
  }

  &__wrapper {
    overflow-y: hidden;
    flex-grow: 1;
    position: relative;
  }

  &__loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.05);
  }

  &__loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
}

.html-editor ::-webkit-scrollbar {
  display: block !important;
}

.html-editor__toc-fab {
  position: fixed;
  right: 16px;
  bottom: 24px;
  z-index: 11;
  width: 44px;
  height: 44px;
  background-color: $bg-color;
  border: 1px solid $dark-border-color;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  svg {
    width: 22px;
    height: 22px;
  }
}

.html-editor__toc-sheet {
  display: flex;
  flex-direction: column;
  // !important: иначе перебивает квазаровское
  // `body.platform-* .q-dialog__inner--minimized > div { max-height: calc(100vh - 108px) }`
  max-height: 60vh !important;
  // !important на нижних: для position="bottom" квазар обнуляет их правилом
  // `.q-dialog__inner--bottom:not(...--animating) > div`
  border-radius: 8px 8px 8px 8px;
  border-bottom-left-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
}

.html-editor__toc-sheet-list {
  overflow-y: auto;
}

.html-editor__toc-link {
  display: block;
  text-decoration: none;
  color: var(--q-primary);
  padding: 2px 0;

  &::before {
    content: '• ';
    display: inline-block;
    width: 1em;
    color: var(--text-color);
  }
}

@media screen and (width < 1024px) {
  .html-editor {
    flex-direction: row;
    overflow-y: visible;

    &__toolbar {
      max-height: 100vh;
      position: sticky !important;
    }
  }
}
</style>
