<template>
  <div
    v-if="editorInstance"
    ref="editorRootRef"
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
          <!-- TODO: EditIcon — not migrated yet -->
          <!-- <EditIcon /> -->
          <v-icon icon="mdi-pencil" size="22" />

          <v-menu
            v-if="props.showHeadings && tocLinks.length"
            v-model="isTocPopupOpen"
            :close-on-content-click="true"
            location="start"
            offset="10"
          >
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon
                variant="text"
                size="small"
                density="compact"
                :class="`html-editor__btn-toc ${classPrevent}`"
                title="Оглавление"
                @click.stop
              >
                <component :is="ICONS.headingsIcon" />
              </v-btn>
            </template>

            <v-card style="max-width: 360px; max-height: 300px" class="overflow-y-auto">
              <v-card-title class="text-subtitle-2 pb-2">
                Оглавление
              </v-card-title>
              <v-divider />
              <v-card-text class="pt-2 pb-2">
                <div v-for="link in tocLinks" :key="link.id">
                  <a
                    href="#"
                    :style="'padding-left:' + `${30 * (link.originalLevel - 1)}px`"
                    class="html-editor__toc-link"
                    @click.prevent="onTocItemClick(link)"
                  >
                    {{ !hasOwnNumeration(link.text) ? link.index + ' ' : ''
                    }}{{ link.text }}
                  </a>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
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
      </div>
    </div>

    <!-- TODO: DocPreviewDialog — not migrated yet -->
    <!--
    <DocPreviewDialog
      v-if="openImage"
      v-model="openImage"
      :file="image"
      :isDiagram="isOpenDiagram"
    />
    -->
    <EditorAnchorDialog
      v-model="editAnchor"
      :editor-instance="editorInstance"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  provide,
  inject,
  nextTick,
} from 'vue';
import { useDisplay, useTheme } from 'vuetify';
import { useResizeObserver } from '@vueuse/core';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { TextSelection } from '@tiptap/pm/state';

// TODO: tableOfContents util — not migrated yet
// import { generateHeadingLinks } from 'src/utils/tableOfContents';
// TODO: EditIcon / DocPreviewDialog — not migrated yet
// import EditIcon from '../icons/EditIcon.vue';
// import DocPreviewDialog from '../dialogs/DocPreviewDialog.vue';
// TODO: aiplan / useMenuHandler — not migrated yet
// import aiplan from 'src/utils/aiplan';
// import { useMenuHandler } from 'src/composables/useMenuHandler';

import EditorTipTapToolbar from './components/EditorTipTapToolbar.vue';
// import DefaultLoader from '@/components/loaders/DefaultLoader.vue';
import { getEditorExtensions } from './extensions/extensionConfigure/extensions';
import {
  getEditorProps,
  useHandleMouseUp,
  replaceColor,
} from './utils/editorUtils';
import EditorAnchorDialog from './components/EditorAnchorDialog.vue';
import EditorTooltipMention from './components/EditorTooltipMention.vue';
import { ICONS } from '@/utils/icons';
import { useFloatScroll } from './composables/useFloatScroll';
import {
  createEditorEventBus,
  type EditorEventBus,
} from './utils/eventBus';

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
}

interface ContentMention {
  avatar?: string;
  username?: string;
  email?: string;
  avatarText?: string;
  title?: string;
}

interface TocLink {
  id: string;
  text: string;
  index: string | number;
  originalLevel: number;
}

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
  excludedTabs: undefined,
});

const emits = defineEmits<{
  'update:modelValue': [string];
  getEditor: [Editor | null];
  enableEditing: [];
  'toggle-fullscreen': [];
  updateEditorDOM: [any];
}>();

const { mdAndDown, mobile } = useDisplay();
const theme = useTheme();
const injectedBus = inject<EditorEventBus | undefined>('bus', undefined);
const bus = injectedBus ?? createEditorEventBus();
provide('bus', bus);

const editorInstance = shallowRef<Editor | null>(null);
const editorRootRef = ref<HTMLElement | null>(null);
const isFormatSampleActive = ref<boolean>(false);
const editorToolbarHeight = ref<number>(0);
const openImage = ref<boolean>(false);
const image = ref<Record<string, any>>({ asset: '' });
const editAnchor = ref<boolean>(false);
const editorKey = ref<string>(
  props.editorId + (props.readOnlyEditor ? 'readonly' : ''),
);
const tocLinks = ref<TocLink[]>([]);

const isTooltipMention = ref<boolean>(false);
const tooltipAnchorMention = ref<HTMLElement>();
const tooltipContentMention = ref<ContentMention>({});
const isShowEdit = ref<boolean>(false);
const isOpenDiagram = ref<boolean>(false);
const isTocPopupOpen = ref<boolean>(false);

// TODO: useMenuHandler(tocPopupRef);
const { floatScroll, clearFloatScroll } = useFloatScroll(editorInstance);

const isMobile = computed(() => mobile.value && mdAndDown.value);
const isReadOnly = computed(() => !props.canEdit || props.readOnlyEditor);
provide('isEditorReadOnly', isReadOnly);
const editorExtensions = computed(() => getEditorExtensions(props));

useResizeObserver(editorRootRef, (entries) => {
  if (!isMobile.value) return;
  const entry = entries[0];
  if (entry) editorToolbarHeight.value = entry.contentRect.height;
});

/** Temporary stub until tableOfContents util is migrated */
const generateHeadingLinks = (items: any[] = []): TocLink[] => {
  return (items || []).map((item: any, index: number) => ({
    id: item.id ?? String(index),
    text: item.textContent ?? item.text ?? '',
    index: item.itemIndex ?? index + 1,
    originalLevel: item.originalLevel ?? item.level ?? 1,
  }));
};

const hasOwnNumeration = (heading: string) => {
  const firstChar = heading[0];
  return /\d/.test(firstChar);
};

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
  // TODO: aiplan.UserName — temporary local fallback
  const parts = [member?.first_name, member?.last_name].filter(Boolean);
  if (!parts.length && member?.username) parts.push(member.username);
  if (isUserName) return parts.join(' ');
  return parts.map((m: string) => m[0]).join(' ');
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
      emits('update:modelValue', editorInstance.value?.getHTML() ?? '');
      emits('updateEditorDOM', editorInstance.value?.state.doc);
      refreshTocLinks();
      floatScroll();
    },
    onCreate: () => {
      emits('updateEditorDOM', editorInstance.value?.state.doc);
      refreshTocLinks();
      floatScroll();
    },
    editorProps: getEditorProps(editorInstance, onCommentLink),
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

const onTocItemClick = (link: TocLink) => {
  if (!editorInstance.value) return;
  const editor = editorInstance.value;

  const element = editor.view.dom.querySelector(`[data-toc-id="${link.id}"]`);

  if (!element) return;

  try {
    const pos = editor.view.posAtDOM(element, 0);
    const tr = editor.view.state.tr;
    tr.setSelection(new TextSelection(tr.doc.resolve(pos)));
    editor.view.dispatch(tr);
    editor.view.focus();
  } catch {
    // ignore
  }

  isTocPopupOpen.value = false;

  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - 60,
    behavior: 'smooth',
  });
};

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

const onCommentLink = (commentData: any) => {
  if (isReadOnly.value) {
    if (commentData) bus?.emits('openSingleComment', commentData);
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
          editorInstance.value!.extensionStorage.tableOfContents.content,
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
    if (!editorInstance.value) return;
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
      const mode = theme.global.current.value.dark ? 'dark' : 'light';
      const content = replaceColor(newVal, mode);
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
});
</script>

<style scoped lang="scss">
.html-editor {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__toolbar {
    overflow: hidden;
    position: sticky;
    flex-shrink: 0;
    top: 0;
    z-index: 10;
    background-color: var(--bg-color, #fff);
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
    background-color: var(--bg-color, #fff);
    border-radius: 0 8px 8px 0;
    border-left: 1px solid var(--dark-border-color, #dde2ea);
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

.html-editor__toc-link {
  display: block;
  text-decoration: none;
  color: rgb(var(--v-theme-primary));
  padding: 2px 0;

  &::before {
    content: '• ';
    display: inline-block;
    width: 1em;
    color: var(--text-color, #474a52);
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
