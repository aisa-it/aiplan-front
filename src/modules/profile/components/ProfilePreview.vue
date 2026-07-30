<template>
  <div class="flex items-center">
    <UserAvatarMenu :user="user" size="extralarge" hide-full-name />

    <div class="ml-4">
      <div class="flex items-center gap-2">
        <h4
          class="wrap-break-word font-medium"
          :class="mobile ? 'text-lg' : 'text-3xl'"
        >
          {{ fullName }}
        </h4>

        <!-- <SelectUserStatus /> -->
      </div>

      <p class="text-lg text-medium-emphasis text-secondary">
        {{ user.email }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import UserAvatarMenu from './user-info-popup/UserAvatarMenu.vue';
import { getUserName } from '../utils/helpers.ts';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const { mobile } = useDisplay();

const props = defineProps<{
  user: DtoUser;
}>();

const fullName = computed(() => getUserName(props.user, false));
</script>
