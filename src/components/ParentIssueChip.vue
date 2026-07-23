<template>
  <q-btn
    dense
    flat
    no-caps
    v-if="!!row.parent && !!row?.parent_detail?.sequence_id"
    :to="`/${$route.params.workspace}/projects/${row.project_detail?.identifier ?? $route.params.project}/issues/${row?.parent_detail?.sequence_id}`"
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
        `Родитель: ${row.project_detail?.identifier} - ${row.parent_detail?.sequence_id}`
      }}
    </HintTooltip>
  </q-btn>
</template>
<script setup lang="ts">
import ConnectIcon from './icons/ConnectIcon.vue';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{
  row: DtoIssue;
  target: string;
}>();
</script>
