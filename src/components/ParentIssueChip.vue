<template>
  <q-btn
    dense
    flat
    no-caps
    v-if="!!row.parent && !!row?.parent_detail?.sequence_id"
    :to="`/${$route.params.workspace}/projects/${$route.params.project}/issues/${row?.parent_detail?.sequence_id}`"
    :target="target ?? '_self'"
    class="base-chip base-chip--bordered"
    :style="'padding: 1px 6px'"
  >
    <ConnectIcon
      :style="'padding: 0 2px'"
      :color="'var(--primary)'"
      :height="16"
      :width="16"
    />
    <div class="color-primary">{{ row?.parent_detail?.sequence_id }}</div>
    <HintTooltip>
      {{
        `Родитель: ${row.project_detail.identifier} - ${row?.parent_detail?.sequence_id}`
      }}
    </HintTooltip>
  </q-btn>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import ConnectIcon from './icons/ConnectIcon.vue';

export default defineComponent({
  name: 'ParentIssueChip',
  props: ['row', 'target'],
  components: {
    ConnectIcon,
  },
});
</script>
