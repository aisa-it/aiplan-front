<template>
  <!-- TODO: переходить к активностям автора после переноса страницы. -->
  <span v-if="user" class="inline-flex" @click.stop>
    <UserAvatarMenu :user="user" />
  </span>
</template>

<script setup lang="ts">
import type { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';

defineProps<{ user?: DtoUserLight | null }>();
</script>
