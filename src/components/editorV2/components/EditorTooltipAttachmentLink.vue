<template>
  <NodeViewWrapper
    as="span"
    class="special-link-mention issue-link"
    contenteditable="false"
  >
    <a
      v-if="!loading"
      class="flex items-center gap-x-xs"
      :href="node.attrs.originalUrl"
      target="_blank"
      style="text-decoration: none; color: inherit"
    >
      <template v-if="attachmentData">
        <span class="link-like">{{
          attachmentData?.title
        }}</span>
      </template>
      <HintTooltip>
        {{
          attachmentData?.projectIdentifier +
          '-' +
          attachmentData?.currentIssueId
        }}
      </HintTooltip>
      <span v-if="!attachmentData" class="text-italic">Нет доступа</span>
    </a>
    <q-spinner v-else />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { useLoad } from 'src/composables/useLoad';

const props = defineProps(nodeViewProps);

const attachmentData = ref<any>();

const getAttachmentData = async () => {

  attachmentData.value = {
    slug: props.node.attrs.slug,
    projectIdentifier: props.node.attrs.projectIdentifier,
    currentIssueId: props.node.attrs.currentIssueId,
    title: props.node.attrs.title,
  };
};

const { loading, onLoad } = useLoad(getAttachmentData);

onMounted(() => {
  onLoad();
});
</script>
