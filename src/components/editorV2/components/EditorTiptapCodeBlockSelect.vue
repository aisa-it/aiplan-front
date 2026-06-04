<template>
  <node-view-wrapper class="code-block">
    <q-select
      v-if="showCodeSelect"
      v-model="selectedLanguage"
      :options="languages"
      hide-dropdown-icon
      options-dense
      :popup-content-class="`html-editor__select-option scrollable-content ${classPrevent}`"
      contenteditable="false"
    >
    </q-select>
    <pre><code><node-view-content /></code></pre>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { NodeViewWrapper, NodeViewContent, Editor } from '@tiptap/vue-3';

const props = defineProps<{
  node: any;
  updateAttributes: (data: any) => any;
  extension: any;
  editor: Editor | null;
  classPrevent: string;
}>();

const languages = ref<string[]>([
  'auto',
  'css',
  'html',
  'js',
  'ts',
  'java',
  'c',
  'php',
  'lua',
]);

const selectedLanguage = computed({
  get() {
    return props.node.attrs.language ?? 'auto';
  },
  set(language) {
    props.updateAttributes({ language });
  },
});

const showCodeSelect = computed(() => {
  return props.editor?.isEditable && props.extension.options.isCodeSelect;
});
</script>

<style lang="scss">
.tiptap {
  .code-block {
    position: relative;

    .q-select {
      position: absolute;
      width: 120px;
      right: 0.5rem;
      top: 0.5rem;

      .q-field__control {
        background-color: #ffffff;
        min-height: 24px;
        max-height: 24px;

        .q-field__native {
          padding: 4px 0;
          max-height: 24px;
          min-height: 24px;
        }
      }
    }
  }
}
</style>
