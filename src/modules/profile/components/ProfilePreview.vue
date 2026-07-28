<template>
  <div class="flex items-center">
    <UserAvatar
      :image="user.avatar_id"
      :text="avatarText"
      :size="avatarSize"
      :ny="ny"
    />

    <div class="ml-4">
      <div class="flex items-center gap-2">
        <h4
          class="wrap-break-word font-medium"
          :class="isMobile ? 'text-lg' : 'text-3xl'"
        >
          {{ fullName }}
        </h4>

        <!-- <SelectUserStatus /> -->
      </div>

      <p class="text-lg text-medium-emphasis">
        {{ user.email }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import UserAvatar from './user-info-popup/UserAvatar.vue';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = withDefaults(
  defineProps<{
    user: DtoUser;
    isMobile?: boolean;
    ny?: boolean;
  }>(),
  {
    isMobile: false,
    ny: false,
  },
);

const avatarSize = computed(() => (props.isMobile ? 60 : 100));

const fullName = computed(() =>
  `${props.user.first_name ?? ''} ${props.user.last_name ?? ''}`.trim(),
);

const avatarText = computed(() =>
  [props.user.first_name?.[0], props.user.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase(),
);
</script>
