<template>
  <div v-if="editorInstance" class="html-editor">
    <EditorContent :id="editorId" :editor="editorInstance" />
  </div>
</template>

<script setup lang="ts">
// core
import { onMounted, ref, onBeforeMount, watch } from 'vue';

// editor
import { EditorContent, Editor } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';

// utils
import {
  CodeBlockLowlightExtend,
  CustomKeyboardBehaviour,
  StopPageScrollExtension,
} from 'src/components/editorV2/utils/tiptap';

const props = defineProps<{
  editorId?: string;
  content?: string;
}>();

const emits = defineEmits<{
  'update:content': [value: string];
  getEditor: [value?: Editor];
}>();

// vars
const editorInstance = ref<Editor>();

// function
const onUpdate = () => {
  emits('getEditor', editorInstance.value);
  emits('update:content', editorInstance.value?.getHTML() || '');
};

const initialEditor = () => {
  editorInstance.value = new Editor({
    extensions: [
      Document,
      Text,
      History,
      CodeBlockLowlightExtend.extend({
        addKeyboardShortcuts() {
          return {
            'Mod-Enter': () => true,
          };
        },
      }).configure({
        isCodeSelect: false,
        defaultLanguage: 'lua',
      }),
      CustomKeyboardBehaviour,
      StopPageScrollExtension,
    ],
    content: `<pre><code>${props.content ?? ''}</code></pre>`,
    onUpdate,
  });

  emits('getEditor', editorInstance.value);
};

const recreateEditor = () => {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }
  initialEditor();
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
</script>
<style lang="scss" scoped>
.html-editor {
  :deep(.tiptap) {
    min-height: auto;
    padding: 0;

    pre {
      margin: 0;
    }
  }
}

.body--dark {
  .html-editor {
    :deep(.tiptap) {
      pre {
        border: 1px solid $extra-light;
        background-color: inherit;
      }
    }
  }
}
</style>
