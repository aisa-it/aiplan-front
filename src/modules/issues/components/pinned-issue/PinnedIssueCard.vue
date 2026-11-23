<template>
  <article class="pinned-issue-card">
    <div class="flex min-w-0 flex-col gap-1 text-base leading-[22px] tracking-[0.5px]">
      <span class="font-semibold text-text-default">
        {{ issue.project_detail?.identifier }}-{{ issue.sequence_id }}
      </span>
      <div class="relative min-w-0 pt-1 text-secondary">
        <span class="block truncate" :title="issue.name">{{ issue.name }}</span>
        <span
          v-if="issue.draft"
          class="absolute -top-1.5 left-0.5 rounded bg-orange-500 px-1 py-0.5 text-xs leading-3 text-white"
        >
          {{ t('issues.draft') }}
        </span>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex min-h-8 max-w-full items-center gap-2 rounded-2xl border border-border px-3">
        <span
          class="h-3 w-3 shrink-0 rounded-full"
          :style="{ backgroundColor: issue.state_detail?.color }"
        />
        <span class="min-w-0 break-words">{{ issue.state_detail?.name }}</span>
      </span>

      <div v-if="issue.assignee_details?.length" class="flex items-center pl-2.5 -space-x-2.5">
        <span
          v-for="(assignee, index) in visibleAssignees"
          :key="assignee.id"
          class="relative shrink-0 rounded-full bg-[rgb(var(--v-theme-background))]"
          :style="{ zIndex: visibleAssignees.length - index }"
        >
          <UserAvatarMenu :user="assignee" />
        </span>
        <span
          v-if="extraAssignees > 0"
          class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--v-theme-surface))] text-xs"
        >
          +{{ extraAssignees }}
        </span>
      </div>
      <UserAvatarMenu v-else-if="issue.author_detail" :user="issue.author_detail" />

      <ParentIssueChip :issue="issue" />
      <QuantityChip column="attachment_count" :count="issue.attachment_count" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useUserStore } from '@/stores/user-store';
import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';
import ParentIssueChip from '../ParentIssueChip.vue';
import QuantityChip from '../QuantityChip.vue';

const props = defineProps<{ issue: DtoIssueWithCount }>();
const { t } = useI18n();
const { user } = storeToRefs(useUserStore());

const visibleAssignees = computed(() =>
  [...(props.issue.assignee_details ?? [])]
    .sort((a, b) => Number(b.id === user.value?.id) - Number(a.id === user.value?.id))
    .slice(0, 3),
);
const extraAssignees = computed(() =>
  Math.max(0, (props.issue.assignee_details?.length ?? 0) - 3),
);
</script>

<style scoped>
.pinned-issue-card {
  display: flex;
  min-height: 148px;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 16px;
  padding: 12px;
  box-shadow: var(--shadow-default);
}
</style>
