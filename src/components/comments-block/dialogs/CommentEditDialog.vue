<template>
  <q-dialog
    persistent
    v-if="comment"
    :model-value="modelValue"
    @update:modelValue="updateModelValue"
  >
    <q-card class="issue-comment-edit-dialog">
      <q-card-section>
        <EditorTipTapV2
          editor-id="comment-editor"
          v-model="issueCommentHtml"
          is-mention
          :members="validWorkspaceUsers"
          :get-members-for-mention="getMembersForMention"
          @get-editor="getEditor"
          @updateEditorDOM="updateEditorDOM"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-px-md">
        <q-btn
          flat
          dense
          no-caps
          class="secondary-btn"
          label="Отмена"
          v-close-popup
        />
        <q-btn
          :disable="isEmpty"
          flat
          dense
          no-caps
          class="primary-btn"
          label="Сохранить"
          v-close-popup
          @click="handleUpdateMessage"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { IIssueCommentUpdate } from 'src/interfaces/issues';

// Store
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import { isEditorEmpty } from 'src/components/editorV2/utils/editorUtils';

// Props
const props = defineProps<{
  modelValue: boolean;
  comment: { comment_html: string };
  members?: Array<any>;
  isAutoSave?: boolean;
  getMembersForMention: (search: string) => Promise<Array<any> | void>;
}>();

const workspaceStore = useWorkspaceStore();
const { workspaceUsers } = storeToRefs(workspaceStore);

const validWorkspaceUsers = filterValidMembers([...workspaceUsers.value]);
function filterValidMembers(list: Record<string, any>[]) {
  return list.filter((m) => m.member?.is_active && m.member?.username);
}

const emit = defineEmits(['onSave', 'update:modelValue']);

// Reactive variables
const editor = ref<Editor | null>(null);
const editorDOMvalue = ref();
const issueCommentHtml = ref<string>('');
const isEmpty = computed(() => isEditorEmpty(editorDOMvalue.value));

// Computed properties

// Functions
const handleUpdateMessage = () => {
  if (!editor.value || isEmpty.value) return;

  const saveData: IIssueCommentUpdate = {
    content: issueCommentHtml.value,
    text: editor.value.getText(),
  };
  emit('onSave', saveData);
};

const getEditor = (value: Editor | null) => {
  editor.value = value;
};

const updateEditorDOM = (value: boolean) => {
  editorDOMvalue.value = value;
};

const updateModelValue = (value: boolean) => emit('update:modelValue', value);

// Watchers
watch(
  () => props.comment,
  () => {
    issueCommentHtml.value = props.comment.comment_html;
  },
);

// Lifecycle hooks
onMounted(() => {
  editor.value = null;
  issueCommentHtml.value = '';
});
</script>

<style scoped lang="scss">
.issue-comment-edit-dialog {
  min-width: calc(66vw - 25px);
}

@media screen and (min-width: 1024px) {
  :deep(.html-editor) {
    overflow: visible !important;
  }

  :deep(.html-editor__toolbar) {
    width: 99%;
    height: auto;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: $bg-color;
  }
}
</style>
