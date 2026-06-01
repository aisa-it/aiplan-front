<template>
  <q-dialog no-refocus class="reply-preview-dialog">
    <q-card
      v-if="commentPreview.comment_html"
      class="reply-preview-dialog__card"
    >
      <q-card-section>
        <EditorTipTapV2
          editor-id="reply-editor"
          :model-value="commentPreview.comment_html"
          is-mention
          :members="members"
          :can-edit="false"
          read-only-editor
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';

defineProps<{
  commentPreview: any;
  members: any[];
}>();
</script>

<style scoped lang="scss">
.reply-preview-dialog {
  &__card {
    min-width: calc(66vw - 25px);

    ::-webkit-scrollbar {
      display: block;
    }
  }
}
</style>
