<template>
  <div class="isolate flex items-center justify-center -space-x-2.5">
    <!-- TODO: переходить к активностям исполнителя после переноса страницы. -->
    <span
      v-for="(user, index) in users"
      :key="user.id"
      class="relative shrink-0 rounded-full bg-[rgb(var(--v-theme-background))]"
      :style="{ zIndex: (users?.length ?? 0) - index }"
      @click.stop
    >
      <UserAvatarMenu :user="user" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';

defineProps<{ users?: DtoUserLight[] | null }>();
</script>
