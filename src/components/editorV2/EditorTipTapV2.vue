<template>
  <div
    v-if="editorInstance"
    :class="[
      'html-editor',
      { 'html-editor--mobile': isMobile, classPrevent: classPrevent },
    ]"
    :style="{ paddingLeft: isMobile && !isReadOnly ? '48px' : '0' }"
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
      @enable-editing="$emit('enableEditing')"
      @toggle-fullscreen="$emit('toggle-fullscreen')"
    />
    <div class="html-editor__wrapper">
      <div v-if="loading" class="html-editor__loading-overlay"></div>
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

    <transition name="fade">
      <span
        v-if="canEdit && isReadOnly"
        :class="`html-editor__btn-edit ${classPrevent}`"
        title="Нажмите для редактирования"
        @click="$emit('enableEditing')"
      >
        <EditIcon />
      </span>
    </transition>

    <DocPreviewDialog
      v-if="openImage"
      v-model="openImage"
      :file="image"
      :isDiagram="isOpenDiagram"
    />
    <EditorAnchorDialog
      v-model="editAnchor"
      :editor-instance="editorInstance"
    />
  </div>
</template>

<script lang="ts" setup>
// Vue
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  provide,
  inject,
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
import EditorAnchorDialog from './components/EditorAnchorDialog.vue';
import EditorTooltipMention from './components/EditorTooltipMention.vue';
import aiplan from 'src/utils/aiplan';

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
  excludedTabs: undefined,
});

// Emits
const emit = defineEmits([
  'update:modelValue',
  'getEditor',
  'enableEditing',
  'isEditorEmpty',
  'toggle-fullscreen',
  'updateEditorDOM',
]);

const $q = useQuasar();
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

// mentions
const isTooltipMention = ref<boolean>(false);
const tooltipAnchorMention = ref<HTMLElement>();
const tooltipContentMention = ref<ContentMention>({});
const isShowEdit = ref<boolean>(false);
const isOpenDiagram = ref<boolean>(false);

const isMobile = computed(() => $q.platform.is.mobile && Screen.lt.md);
const isReadOnly = computed(() => !props.canEdit || props.readOnlyEditor);
provide('isEditorReadOnly', isReadOnly);

const editorExtensions = computed(() => getEditorExtensions(props));

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

  isShowEdit.value = false;
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
    content: props.modelValue,
    editable: !isReadOnly.value,
    extensions: editorExtensions.value,
    onUpdate: () => {
      emit('update:modelValue', editorInstance.value?.getHTML());
      emit('updateEditorDOM', editorInstance.value?.state.doc);
    },
    onCreate: () => {
      emit('updateEditorDOM', editorInstance.value?.state.doc);
    },
    editorProps: getEditorProps(editorInstance, onCommentLink),
    classPrevent: props.classPrevent,
  });
  const { addMouseUpListener } = useHandleMouseUp(
    editorInstance,
    isFormatSampleActive,
  );
  addMouseUpListener();
  emit('getEditor', editorInstance.value);
}

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
  (newVal) => {
    editorInstance.value.setOptions({
      editable: !newVal,
    });
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance.value && newVal !== editorInstance.value.getHTML()) {
      let content = replaceColor(newVal, $q.dark.isActive ? 'dark' : 'light');
      editorInstance.value.commands.setContent(content, false);
    }
  },
);

onMounted(() => createEditor());

onBeforeUnmount(() => {
  editorInstance.value?.destroy();
});

defineExpose({
  updateToC,
});
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
    overflow-y: hidden;
    flex-grow: 1;
  }
}

.html-editor ::-webkit-scrollbar {
  display: block !important;
}
</style>
