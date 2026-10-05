<template>
  <div class="flex items-center">
    <UserAvatarMenu :user="user" size="extralarge" hide-full-name />

    <div class="ml-4">
      <div class="flex items-center gap-1">
        <h4 class="wrap-break-word font-medium text-3xl">
          {{ fullName }}
        </h4>
        <UserStatusMenu :user="user" />
      </div>

      <p class="text-lg text-medium-emphasis text-secondary">
        {{ user.email }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';
import UserStatusMenu from '@/components/user-status/UserStatusMenu.vue';

import { getUserName } from '@/utils/helpers.ts';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  user: DtoUser;
}>();

const fullName = computed(() => getUserName(props.user, false));
</script>
