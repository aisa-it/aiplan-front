<template>
  <span
    class="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1 text-xs"
    :style="{
      backgroundColor: group.color ?? '#bac4d5',
      color: badgeTextColor(group.color),
    }"
  >
    {{ group.total }}
  </span>
  <UserAvatar v-if="group.user" :user="group.user" size="small" />
  <span class="min-w-0 flex-1 wrap-break-word font-semibold">
    {{ group.title }}
  </span>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/user-avatar/UserAvatar.vue';
import type { IssueGroupHeader } from '../../model/issue-groups';

defineProps<{ group: IssueGroupHeader }>();

const badgeTextColor = (color?: string) => {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return '#474a52';
  const rgb = Number.parseInt(color.slice(1), 16);
  const luminance =
    ((rgb >> 16) * 299 + ((rgb >> 8) & 255) * 587 + (rgb & 255) * 114) / 1000;
  return luminance >= 128 ? '#474a52' : '#fff';
};
</script>
