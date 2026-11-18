<template>
  <span
    v-if="issue.parent && issue.parent_detail?.sequence_id && !hideParent"
    class="inline-flex min-h-8 items-center rounded-2xl border border-border text-primary"
    :class="compact ? 'px-1.5 py-px' : 'px-2'"
    :title="t('issues.parent', {
      identifier: issue.project_detail?.identifier,
      sequence: issue.parent_detail.sequence_id,
    })"
  >
    <ConnectIcon :width="16" :height="16" class="mx-0.5" />
    {{ issue.parent_detail.sequence_id }}
  </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import ConnectIcon from '@/components/icons/ConnectIcon.vue';

defineProps<{
  issue: DtoIssueWithCount;
  hideParent?: boolean;
  compact?: boolean;
}>();

const { t } = useI18n();
</script>
