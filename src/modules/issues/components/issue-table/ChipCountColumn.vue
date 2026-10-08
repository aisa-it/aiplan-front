<template>
  <div class="flex justify-center">
    <span
      class="inline-flex min-h-8 items-center rounded-2xl border border-border px-3 leading-4.5 tracking-[0.5px]"
    >
      <component :is="COUNT_ICONS[column]" :width="16" :height="16" />
      {{ count ?? 0 }}
    </span>
  </div>
</template>

<script setup lang="ts">
import ClipIcon from '@/components/icons/ClipIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import DotListIcon from '@/components/icons/DotListIcon.vue';
import LinkedIssueIcon from '@/components/icons/LinkedIssueIcon.vue';

const COUNT_ICONS = {
  sub_issues_count: DotListIcon,
  linked_issues_count: LinkedIssueIcon,
  link_count: LinkIcon,
  attachment_count: ClipIcon,
};

defineProps<{
  column: keyof typeof COUNT_ICONS;
  count?: number;
}>();
</script>
