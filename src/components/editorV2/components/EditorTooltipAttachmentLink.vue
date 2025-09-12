<template>
  <NodeViewWrapper
    as="span"
    class="special-link-mention attachment-link"
    contenteditable="false"
  >
    <a
      v-if="!loading"
      class="flex items-center gap-x-xs"
      :href="props.node.attrs?.originalUrl"
      @click.prevent="
        handleDownload(props.node.attrs?.originalUrl, props.node.attrs?.title)
      "
      style="text-decoration: none; color: inherit"
    >
      <span class="link-like">{{ props.node.attrs?.title }}</span>

      <HintTooltip v-if="sourse">
        {{ tooltip }}
      </HintTooltip>
    </a>
    <q-spinner v-else />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';
import { useLoad } from 'src/composables/useLoad';
import { useAiDocStore } from 'src/stores/aidoc-store';

const props = defineProps(nodeViewProps);

const aidocStore = useAiDocStore();
const sourse = ref();

const tooltip = computed(() => {
  const title = props.node.attrs?.title;
  const type = props.node.attrs?.type === 'aidoc' ? 'документу' : 'задаче';
  return `${title} прикреплён к ${type} ${sourse.value}`;
});

const getAttachmentData = async () => {
  if (props.node.attrs.type === 'aidoc') {
    sourse.value = (
      await aidocStore.getAiDoc(props.node.attrs?.slug, props.node.attrs?.docId)
    )?.data?.title;
  } else {
    sourse.value =
      props.node.attrs?.projectIdentifier +
      '-' +
      props.node.attrs?.currentIssueId;
  }
};

const handleDownload = async (link: string, filename: string) => {
  const { data } = await axios.get(link, {
    responseType: 'blob',
    withCredentials: true,
  });

  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
};

const { loading, onLoad } = useLoad(getAttachmentData);

onMounted(() => {
  onLoad();
});
</script>
