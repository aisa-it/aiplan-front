<template>
  <div
    v-if="editorInstance"
    class="html-editor"
    :class="{ classPrevent, 'html-editor--mobile': isMobile }"
    :style="`padding-left: ${isMobile && !isReadOnly ? '48px' : 0}`"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <EditorTipTapToolbar
      v-if="!isReadOnly"
      :editorInstance="editorInstance"
      :is-readOnly="isReadOnly"
      :is-format-sample-active="isFormatSampleActive"
      :classPrevent="classPrevent"
      :disableImages="disableImages"
      :excluded-tabs="excludedTabs"
      :isMobile="isMobile"
      :style="{
        height: isMobile ? editorToolbarHeight + 'px' : 'auto',
        minHeight: isMobile ? '100%' : 'auto',
      }"
      class="html-editor__toolbar"
      @toggle-format-sample="toggleFormatSample"
      @open-link="isShowTooltipLink = !isShowTooltipLink"
      @enable-editing="emits('enableEditing')"
      @toggle-fullscreen="emits('toggle-fullscreen')"
      :isFullScreen="$props.isFullScreenView"
    />

    <div
      class="html-editor__wrapper"
      :style="`${isFullScreen && !isMobile ? 'height: 94%' : undefined}`"
    >
      <div
        v-if="loading"
        style="
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: black;
          opacity: 0.1;
          border-radius: 8px;
          z-index: 10000;
        "
      ></div>
      <DefaultLoader
        v-if="loading"
        style="
          position: absolute;
          top: calc(50% - 25px);
          left: calc(50% - 25px);
          z-index: 10001;
        "
      />

      <EditorContent
        :id="editorId"
        :key="editorKey"
        :editor="editorInstance"
        class="html-editor__container"
        :class="[
          {
            'html-editor__readonly': isReadOnly,
            'html-editor__scroll-visible': isReadOnly,
            'html-editor__resize': canResize,
          },
          classPrevent,
        ]"
        @click="handleClickEditor"
        :style="`${isFullScreen ? 'height: 100%' : undefined}`"
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
    <transition>
      <span
        v-if="isShowEdit && isReadOnly"
        class="html-editor__btn-edit"
        :class="classPrevent"
        title="Нажмите для редактирования"
        @click="emits('enableEditing')"
      >
        <EditIcon />
      </span>
    </transition>
    <DocPreviewDialog v-if="openImage" v-model="openImage" :file="image" />
    <EditorAnchorDialog
      v-model="editAnchor"
      :editor-instance="editorInstance"
    />
  </div>
</template>

<script setup lang="ts">
// core
import {
  onMounted,
  ref,
  watch,
  computed,
  onBeforeMount,
  provide,
  inject,
} from 'vue';

// editor
import { EditorContent, Editor } from '@tiptap/vue-3';
import {Table} from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import TableRow from '@tiptap/extension-table-row';
import TaskList from '@tiptap/extension-task-list';
import TableCell from '@tiptap/extension-table-cell';
import {TextStyle} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize } from 'tiptap-extension-font-size';
import FontFamily from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import TableHeader from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { DateNode } from 'src/utils/dateEditor';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Spoiler } from 'src/utils/spoiler';
import { InfoBlock } from 'src/utils/infoBlock';
// utils
import aiplan from 'src/utils/aiplan';
import { CommentLinkMention } from 'src/utils/commentLinkEditor';
import {
  CustomLink,
  useMention,
  cleanContent,
  IndentExtend,
  isEditorEmpty,
  useEditorMarks,
  ContentMention,
  TaskItemExtend,
  ListItemExtend,
  CustomUnderline,
  CustomImagePlugin,
  CustomKeyboardBehaviour,
  StopPageScrollExtension,
  CodeBlockLowlightExtend,
  DisableImagesExtension,
  ExitTableGapCursor,
  SpecialMentionHandler,
  BackspaceSelectionDelete,
  TabListSink,
  UnlinkOnSpace,
  UnsetSubSuperOnEnter,
  DrawIoExtension,
} from 'src/components/editorV2/utils/tiptap';
import { isValidURL } from 'src/utils/validation';
import { useQuasar, Screen, EventBus } from 'quasar';
// components
import EditIcon from 'src/components/icons/EditIcon.vue';
import DocPreviewDialog from 'src/components/dialogs/DocPreviewDialog.vue';
import EditorTipTapToolbar from './EditorTipTapToolbar.vue';
import EditorTooltipMention from './EditorTooltipMention.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import EditorAnchorDialog from './EditorAnchorDialog.vue';
//image
import drawioBaseImage from 'src/components/icons/drawio/start.drawio.png';
import { TextSelection } from '@tiptap/pm/state';

import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IssueLinkMention } from 'src/utils/issueLinkEditor';
import { AttachmentLinkMention } from 'src/utils/attachmentLinkMention';

const props = withDefaults(
  defineProps<{
    editorId: string;
    content?: string;
    readOnlyEditor?: boolean;
    canEdit?: boolean;
    editorPlaceholder?: string;
    isMention?: boolean;
    canResize?: boolean;
    members?: Array<any>;
    loading?: boolean;
    isCodeBlockLowlight?: boolean;
    classPrevent?: string;
    getMembersForMention?: (
      search: string,
    ) => Promise<Array<DtoProjectMemberLight> | void>;
    disableImages?: boolean;
    isFullScreen?: boolean;
    isFullScreenView?: boolean;
    excludedTabs?: Array<string>;
  }>(),
  {
    editorPlaceholder: () => 'Описание',
    isCodeBlockLowlight: () => true,
    canEdit: () => true,
  },
);

const emits = defineEmits([
  'update:content',
  'getEditor',
  'enableEditing',
  'isEditorEmpty',
  'toggle-fullscreen',
]);

const bus = inject('bus') as EventBus;
// vars
const $q = useQuasar();
const editorInstance = ref<Editor>();
const isShowTooltipLink = ref<boolean>(false);
const editorKey = ref<string>(
  props.editorId + props.readOnlyEditor ? 'readonly' : '',
);
const isShowEdit = ref<boolean>(false);

const { mention } = useMention(props.members, props.getMembersForMention);
const { FormatSample } = useEditorMarks();
const isTooltipMention = ref<boolean>(false);
const tooltipAnchorMention = ref<HTMLElement>();
const isFormatSampleActive = ref<boolean>(false);
const tooltipContentMention = ref<ContentMention>({});
const editorToolbarHeight = ref(0);

const image = ref({ asset: '' });
const openImage = ref<boolean>(false);
const editAnchor = ref(false);

// computed
const editorExtensions = computed(() => {
  const extensions = [
    Color,
    FontSize,
    TableRow,
    TaskList,
    TextStyle,
    TableCell.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          'data-bgcolor': {
            default: null,
            parseHTML: (element) => {
              return element.getAttribute('data-bgcolor') || null;
            },
            renderHTML: (attributes) => {
              if (!attributes['data-bgcolor']) return {};
              return {
                'data-bgcolor': attributes['data-bgcolor'],
              };
            },
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor} !important;`,
              };
            },
          },
        };
      },
    }),
    FontFamily,
    TableHeader.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          'data-bgcolor': {
            default: null,
            parseHTML: (element) => {
              return element.getAttribute('data-bgcolor') || null;
            },
            renderHTML: (attributes) => {
              if (!attributes['data-bgcolor']) return {};
              return {
                'data-bgcolor': attributes['data-bgcolor'],
              };
            },
          },
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor} !important;`,
              };
            },
          },
        };
      },
    }),
    Spoiler,
    InfoBlock,
    Superscript,
    Subscript,
    FormatSample,
    TaskItemExtend,
    DateNode,
    ListItemExtend,
    CustomUnderline,
    BackspaceSelectionDelete,
    TabListSink,
    UnlinkOnSpace,
    UnsetSubSuperOnEnter,
    Table.configure({
      resizable: true,
      cellMinWidth: 25,
    }),
    SpecialMentionHandler.configure({
      onCommentLink(data: any) {
        onCommentLink(data);
      },
    }),
    CustomKeyboardBehaviour,
    StopPageScrollExtension,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CustomLink.configure({
      openOnClick: false,
      validate: (url) => isValidURL(url),
    }),
    IndentExtend.configure({
      types: ['paragraph', 'heading'],
    }),
    Placeholder.configure({
      placeholder: props.editorPlaceholder,
      showOnlyWhenEditable: true,
    }),

    DrawIoExtension.configure({
      openDialog: isReadOnly.value ? undefined : 'dblclick',
      baseImage: drawioBaseImage,
    }),
  ];
  if (props.isMention) {
    extensions.push(mention);
  }
  extensions.push(AttachmentLinkMention);
  extensions.push(IssueLinkMention);
  extensions.push(CommentLinkMention);
  if (props.isCodeBlockLowlight) {
    extensions.push(
      StarterKit.configure({
        codeBlock: false,
        listItem: false,
      }),
    );
    extensions.push(
      CodeBlockLowlightExtend.configure({
        isCodeSelect: false,
      }),
    );
  } else {
    extensions.push(
      StarterKit.configure({
        listItem: false,
      }),
    );
  }
  if (!props.disableImages) {
    extensions.push(
      CustomImagePlugin.configure({
        inline: true,
        allowBase64: true,
      }),
    );
  } else {
    extensions.push(DisableImagesExtension);
  }
  extensions.push(ExitTableGapCursor);
  return extensions;
});

const isReadOnly = computed<boolean>(() => {
  if (!props.canEdit) {
    return true;
  }

  return props.readOnlyEditor;
});
provide('isEditorReadOnly', isReadOnly);

const isMobile = computed(() => {
  return $q.platform.is.mobile && Screen.lt.md;
});

// function
const onCommentLink = (commentData: any) => {
  if (isReadOnly.value) {
    if (commentData) bus.emit('openSingleComment', commentData);
  } else {
    editAnchor.value = true;
  }
};

const onUpdate = () => {
  emits('getEditor', editorInstance.value);
  const isEmpty = isEditorEmpty(editorInstance.value);
  emits(
    'update:content',
    isEmpty ? '<p></p>' : editorInstance.value?.getHTML(),
  );
  emits('isEditorEmpty', isEmpty);
};

const handleMouseUp = () => {
  editorInstance.value?.view.dom.addEventListener('mouseup', () => {
    if (!editorInstance.value) return;

    if (isFormatSampleActive.value) {
      editorInstance.value?.chain().focus().applySample().run();
    }

    isFormatSampleActive.value = false;
  });
};

const handleDrop = () => {
  document.addEventListener(
    'drop',
    (event) => {
      if (
        editorInstance.value &&
        !editorInstance.value.view.dom.contains(event.target as Node)
      ) {
        event.preventDefault();
        return;
      }
    },
    false,
  );
};

const initialEditor = () => {
  const content = props.content ?? '';

  editorInstance.value = new Editor({
    parseOptions: {
      preserveWhitespace: 'full',
    },
    extensions: editorExtensions.value,
    editable: !isReadOnly.value,
    content: cleanContent(content, $q.dark.isActive ? 'dark' : 'light'),
    classPrevent: props.classPrevent,
    isValidURL: isValidURL,
    onUpdate,
    onCreate: onUpdate,
    editorProps: {
      handleKeyDown(view, event) {
        if (event.ctrlKey && event.key === 'Enter') {
          event.preventDefault();
          return true;
        }

        if (event.key === 'Enter') {
          const editor = editorInstance.value;

          if (isCursorInsideSpoiler() && !isLastEmptyParagraph()) {
            const { state } = editorInstance.value;

            const paragraph = state.schema.nodes.paragraph.create();
            const tr = state.tr.replaceSelectionWith(paragraph);
            tr.setSelection(
              new TextSelection(tr.doc.resolve(state.selection.$head.pos + 2)),
            );
            // const transaction = state.tr.insert($from.pos + 1, paragraph);
            // transaction.setSelection($from.near(transaction.doc.resolve($from.pos + 1)))
            view.dispatch(tr);
            return true;
          }

          if (isCursorInsideSpoiler() && isLastEmptyParagraph()) {
            console.log('Enter внутри спойлера!');
            clearSpoilerVars();
          }

          if (editor && editor.isActive('subscript')) {
            editor.chain().focus().unsetSubscript().run();
          }

          if (editor && editor.isActive('superscript')) {
            editor.chain().focus().unsetSuperscript().run();
          }
        }

        if (event.key === 'Tab') {
          event.preventDefault();
          if (editorInstance.value) {
            editorInstance.value.chain().focus().sinkListItem('listItem').run();
          }
        }

        return false;
      },
    },
  });

  editorInstance.value?.commands.fixTables();

  handleMouseUp();

  emits('getEditor', editorInstance.value);

  handleDrop();
};

function isCursorInsideSpoiler(): boolean {
  const { state } = editorInstance.value;
  const { $from } = state.selection;

  console.log('pos', $from.pos);
  for (let depth = 0; depth < $from.depth; depth++) {
    const node = $from.node(depth);
    if (node.type.name === 'spoiler') {
      return true;
    }
  }
  return false;
}

function isLastEmptyParagraph(): boolean {
  const { state } = editorInstance.value;
  const { $from } = state.selection;
  const lastNode = $from.node($from.depth);

  // Проверка на последний параграф
  return lastNode.type.name !== 'paragraph' ||
    lastNode.textContent.trim() !== ''
    ? false
    : true;
}

const clearSpoilerVars = (): void => {
  const { state } = editorInstance.value;
  const { $from } = state.selection;
  bus.emit(
    'focusSpoiler',
    $from.pos,
    { bgColor: '', textColor: '' },
    false,
    false,
  );
};

const handleClickEditor = (e: MouseEvent | TouchEvent) => {
  if (e.target?.tagName === 'IMG' && props.readOnlyEditor) {
    e.preventDefault();
    const asset = e.target.dataset.asset;
    image.value.asset = '';

    if (asset) {
      openImage.value = true;
      image.value.asset = asset;
    }
    return;
  }
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

const handleMember = (member: any, isUserName?: boolean): string => {
  if (isUserName) {
    return aiplan.UserName(member).join(' ');
  }

  return aiplan
    .UserName(member)
    .map((m) => m[0])
    .join(' ');
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

  isShowEdit.value = false;
};

const recreateEditor = () => {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }
  editorKey.value += props.readOnlyEditor ? 'readonly' : '';
  initialEditor();
};

const toggleFormatSample = () => {
  isFormatSampleActive.value = !isFormatSampleActive.value;
};

const onResize = (size: any) => {
  if (isMobile.value) editorToolbarHeight.value = size.height;
};

// hook
onMounted(() => {
  initialEditor();
});

onBeforeMount(() => {
  editorInstance.value?.destroy();
});

watch(
  () => props.content,
  (newValue) => {
    if (editorInstance.value && newValue !== editorInstance.value.getHTML()) {
      recreateEditor();
    }
  },
);

watch(
  () => isReadOnly.value,
  () => {
    recreateEditor();
  },
);
</script>

<style scoped lang="scss">
.html-editor {
  overflow-y: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__toolbar {
    overflow: hidden;
    position: sticky;
    flex-shrink: 0;
  }
  &__wrapper {
    overflow-y: auto;
    flex-grow: 1;
  }
}

.html-editor ::-webkit-scrollbar {
  display: block !important;
}
</style>
