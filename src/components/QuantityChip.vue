<template>
  <div class="base-chip base-chip--bordered q-mr-xs">
    <ClipIcon v-if="type === 'attachments'" :height="16" :width="16" />
    <LinkIcon v-if="type === 'links'" :height="16" :width="16" />
    <DotListIcon v-if="type === 'sub-issues'" :height="16" :width="16" />
    <LinkedIssueIcon
      v-if="type === 'linked_issues_count'"
      :height="16"
      :width="16"
    />

    <div>{{ value }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import LinkIcon from './icons/LinkIcon.vue';
import ClipIcon from './icons/ClipIcon.vue';
import DotListIcon from './icons/DotListIcon.vue';
import LinkedIssueIcon from './icons/LinkedIssueIcon.vue';

export default defineComponent({
  name: 'QuantityChip',
  props: ['type', 'value'],
  components: {
    LinkIcon,
    ClipIcon,
    DotListIcon,
    LinkedIssueIcon,
  },
});
</script>
