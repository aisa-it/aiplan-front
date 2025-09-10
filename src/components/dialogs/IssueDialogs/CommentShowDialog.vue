<template>
  <q-dialog ref="dialogRef" @before-show="onOpen" @hide="onHide">
    <q-card class="issue-comment-show-card full-width">
      <q-card-section class="issue-comment-show-card-section">
        <div
          v-if="props.comment"
          class="row justify-between items-center q-mb-xs"
        >
          <h6 style="font-weight: 600; margin: 0 !important">
            {{ title }}
          </h6>
          <q-btn flat dense v-close-popup><CloseIcon /></q-btn>
        </div>
        <div v-if="props.comment">
          <div class="row items-center full-width" style="gap: 10px">
            <span class="comment-info">{{ taskType }}</span>
            <a :href="url" target="_blank" class="primary-link">
              {{ taskName }}
            </a>
          </div>
          <div class="row items-center full-width" style="gap: 10px">
            <span class="comment-info">Автор:</span>
            <span class="comment-info">{{
              getFullName(props.comment?.actor_detail)
            }}</span>
          </div>
        </div>

        <div ref="editorRef" class="q-my-sm full-width">
          <EditorTipTapV2
            :loading="loading"
            editor-id="issue-editor"
            :model-value="props.comment?.comment_html"
            read-only-editor
            :can-edit="false"
            class="issue-comment__editor"
            editor-placeholder="Введите комментарий"
            :class-prevent="isAutoSave ? preventClickClass : ''"
            is-mention
            :members="members"
            :get-members-for-mention="getMembersForMentionFunc"
            @get-editor="getEditor"
          />
        </div>
        <div v-if="props.comment" class="flex">
          <div
            class="row justify-between items-center full-width"
            style="gap: 10px"
          >
            <span class="comment-info"
              >{{ formatDateTimeWithDay(props.comment.created_at!) }}
              <span v-if="props.comment?.updated_by_id"
                >изменено
                <HintTooltip>{{
                  formatDateTimeWithDay(props.comment?.updated_at!)
                }}</HintTooltip>
              </span></span
            >
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed, nextTick, ref } from 'vue';
import { QDialog } from 'quasar';
import { storeToRefs } from 'pinia';

// components
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';

// utils
import { formatDateTimeWithDay } from 'src/utils/time';

// directives
import ClickOutside from 'src/directives/click-outside';
import { getFullName } from 'src/utils/helpers';

// interfaces
import {
  DtoDocComment,
  DtoIssueComment,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IDatasetComment } from 'src/interfaces/dataset';

//stores
import { useUserStore } from 'src/stores/user-store';
import { useAiDocStore } from 'src/stores/aidoc-store';

defineOptions({
  directives: {
    ClickOutside,
  },
});

const props = defineProps<{
  comment: DtoIssueComment & DtoDocComment;
  info?: IDatasetComment;
  members: any[];
  hasPermision?: boolean;
  getMembersForMentionFunc: (value: string) => Promise<any>;
}>();

const emits = defineEmits<{
  clear: [];
}>();

// stores
const userStore = useUserStore();
const aidocStore = useAiDocStore();

// store to refs
const { user } = storeToRefs(userStore);

// vars
const dialogRef = ref<QDialog | null>(null);
const editorRef = ref();
const editor = ref();
const editorValue = ref();
const loading = ref(false);
const url = ref();
const aidocTitle = ref();
const preventClickClass = 'prevent-click-comments-create';

const isAutoSave = computed(() => user.value?.view_props?.autoSave);

const title = computed(() => {
  if (props.info?.type === 'issue') return 'Комментарий к задаче';
  if (props.info?.type === 'aidoc') return 'Комментарий к документу';
  return '';
});

const taskType = computed(() => {
  if (props.info?.type === 'issue') return 'Задача:';
  if (props.info?.type === 'aidoc') return 'Документ:';
  return '';
});

const taskName = computed(() => {
  if (props.info?.type === 'issue')
    return `${props.info?.projectIdentifier}-${props.info?.currentIssueId}`;
  if (props.info?.type === 'aidoc') return aidocTitle.value;
  return '';
});

const getEditor = (edit: Editor) => {
  editor.value = edit;
  nextTick(() => {
    editorRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
};

const getAidocInfo = async () => {
  loading.value = true;
  aidocTitle.value = (
    await aidocStore.getAiDoc(props.info?.slug, props.info?.docId)
  )?.data.title;
  loading.value = false;
};

const refresh = async () => {
  loading.value = true;

  if (props.info?.type === 'issue') {
    url.value = `${location.protocol}//${location.host}/${props.info?.slug}/projects/${props.info?.projectIdentifier}/issues/${props.info?.currentIssueId}`;
  }
  if (props.info?.type === 'aidoc') {
    url.value = `${location.protocol}//${location.host}/${props.info?.slug}/aidoc/${props.info?.docId}`;
  }

  editorValue.value = props.comment?.comment_html;
  loading.value = false;
};

const onOpen = async () => {
  if (props.info?.type === 'aidoc') {
    await getAidocInfo();
  }
  refresh();
};

const onHide = async () => {
  emits('clear');
};
</script>

<style lang="scss" scoped>
.issue-comment-show-card {
  min-width: calc(66vw - 25px);
}

.comment-info {
  opacity: 0.6;
}

.issue-comment__editor {
  :deep(.html-editor__container) {
    min-height: 25rem;
    height: 100%;
  }
  :deep(.tiptap) {
    min-height: 25rem;
    max-height: 25rem;
  }
}
</style>
