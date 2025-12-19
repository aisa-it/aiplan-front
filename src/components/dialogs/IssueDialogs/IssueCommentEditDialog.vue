<template>
  <q-dialog
    persistent
    v-if="comment"
    :model-value="modelValue"
    @update:modelValue="updateModelValue"
    @keyup.ctrl.enter="handleUpdateMessage"
  >
    <q-card class="issue-comment-edit-dialog">
      <q-card-section>
        <EditorTipTapV2
          editor-id="comment-editor"
          v-model="issueCommentHtml"
          is-mention
          :members="members"
          :class-prevent="isAutoSave ? preventClickClass : ''"
          :get-members-for-mention="getMembersForMention"
          @get-editor="getEditor"
          @updateEditorDOM="updateEditorDOM"
          v-click-outside:prevent-click-comments-edit="{
            isAutoSave,
            onClickOutside: handleAutoSave,
          }"
        />
      </q-card-section>
      <q-card-actions align="right" class="q-px-md">
        <q-btn
          flat
          dense
          no-caps
          class="secondary-btn"
          :class="isAutoSave ? preventClickClass : ''"
          label="Отмена"
          style="width: 103px"
          v-close-popup
          @click="isCancel = true"
        />
        <q-btn
          :disable="isEmpty"
          flat
          dense
          no-caps
          class="primary-btn"
          :class="isAutoSave ? preventClickClass : ''"
          label="Сохранить"
          @click="handleUpdateMessage"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  PropType,
  computed,
} from 'vue';

// components
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';

// directives
import ClickOutside from 'src/directives/click-outside';

//interfaces
import { IIssueCommentUpdate } from 'src/interfaces/issues';
import { isEditorEmpty } from 'src/components/editorV2/utils/editorUtils';

export default defineComponent({
  name: 'IssueCommentEditDialog',
  directives: {
    ClickOutside,
  },
  props: {
    modelValue: {
      type: Boolean,
    },
    comment: {
      type: Object,
      required: true,
    },
    members: {
      type: Array,
      required: true,
    },
    isAutoSave: {
      type: Boolean,
      required: false,
      default: false,
    },
    getMembersForMention: {
      type: Function as PropType<
        (search: string) => Promise<Array<any> | void>
      >,
      required: true,
    },
  },
  emits: ['onSave', 'update:modelValue'],
  setup(props, { emit }) {
    // vars
    const isShow = ref<boolean>(true);
    const isCancel = ref<boolean>(false);
    const editor = ref<Editor | null>();
    const editorDOMvalue = ref();
    const issueCommentHtml = ref(props.comment.comment_html);
    const preventClickClass = 'prevent-click-comments-edit';
    const isEmpty = computed(() => isEditorEmpty(editorDOMvalue.value));

    const handleUpdateMessage = () => {
      if (!editor.value) return;

      if (isEmpty.value) return;

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

    const updateModelValue = (value: boolean) => {
      emit('update:modelValue', value);
      isShow.value = false;
      handleAutoSave();
    };

    const handleAutoSave = () => {
      if (isCancel.value) {
        isShow.value = true;
        return;
      }

      if (props.isAutoSave && !isShow.value) {
        handleUpdateMessage();
        isShow.value = true;
      }
    };

    // hooks

    onMounted(() => {
      editor.value = null;
    });

    watch(
      () => props.comment,
      () => {
        issueCommentHtml.value = props.comment.comment_html;
      },
    );

    return {
      isShow,
      isCancel,
      getEditor,
      handleAutoSave,
      updateModelValue,
      issueCommentHtml,
      preventClickClass,
      handleUpdateMessage,
      updateEditorDOM,
      isEmpty,
    };
  },
  components: {
    EditorTipTapV2,
  },
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
