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
      <LinkIcon :width="18" :height="18" />
      <template v-if="issueData">
        <span class="link-like">{{
          issueData?.project_detail?.identifier + '-' + issueData?.sequence_id
        }}</span>
        <span>{{ issueData?.name }} </span>
        <span
          class="q-pa-xs status-badge"
          :style="{
            backgroundColor: issueData?.state_detail?.color! + 50,
            color: issueData?.state_detail?.color,
          }"
        >
          {{ issueData?.state_detail?.name }}</span
        >
      </template>

      <span v-if="!issueData" class="text-italic">Нет доступа</span>
    </a>
    <q-spinner v-else />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useLoad } from 'src/composables/useLoad';
import LinkIcon from 'src/components/icons/LinkIcon.vue';

const props = defineProps(nodeViewProps);

const singleIssueStore = useSingleIssueStore();

const issueData = ref<DtoIssue>();

const getIssueData = async () => {
  issueData.value = (
    await singleIssueStore.getIssueDataById(
      props.node.attrs.slug,
      props.node.attrs.projectIdentifier,
      props.node.attrs.currentIssueId,
    )
  ).data as unknown as DtoIssue;
};

const { loading, onLoad } = useLoad(getIssueData);

onMounted(() => {
  onLoad();
});
</script>

<style lang="scss" scoped>
.status-badge {
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
}
</style>
