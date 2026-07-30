<template>
  <v-btn
    icon
    density="compact"
    class="h-auto! w-auto! min-w-0! p-0! hover:cursor-pointer"
  >
    <UserAvatar :user="user" v-bind="displayUserAvatarOptions" />

    <v-menu
      open-on-hover
      activator="parent"
      transition-show="slide-y-transition"
      transition-hide="slide-y-transition"
      :location="isShowPopupMiddle ? 'bottom center' : undefined"
      :origin="isShowPopupMiddle ? 'top center' : undefined"
    >
      <div
        class="shadow-menu flex max-h-60 max-w-85 items-center justify-center gap-2.5 p-2.5 rounded-2xl"
      >
        <UserAvatar :user="user" :rounded="false" />

        <UserInfoDetails :user="user" v-bind="displayUserInfoOptions" />
      </div>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UserAvatar from './UserAvatar.vue';
import UserInfoDetails from './UserInfoDetails.vue';
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts.ts';
import {
  type DisplayOptions as AvatarDisplayOptions,
  DEFAULT_OPTIONS as AVATAR_DEFAULT,
} from './UserAvatar.config.ts';

import {
  type DisplayOptions as InfoDisplayOptions,
  DEFAULT_OPTIONS as INFO_DEFAULT,
} from './UserInfoDetails.config.ts';

import { pickDefinedKeys } from '../../utils/object.ts';

const props = withDefaults(
  defineProps<
    {
      user: DtoUser;
      isShowPopupMiddle?: boolean;
    } & InfoDisplayOptions &
      AvatarDisplayOptions
  >(),
  {
    isShowPopupMiddle: true,
    ...AVATAR_DEFAULT,
    ...INFO_DEFAULT,
  },
);

const displayUserInfoOptions = computed(() =>
  pickDefinedKeys(props, INFO_DEFAULT),
);

const displayUserAvatarOptions = computed(() =>
  pickDefinedKeys(props, AVATAR_DEFAULT),
);
</script>

<style lang="scss" scoped>
.shadow-menu {
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.dark .shadow-menu {
  box-shadow:
    0 1px 5px rgba(255, 255, 255, 0.2),
    0 2px 2px rgba(255, 255, 255, 0.14),
    0 3px 1px -2px rgba(255, 255, 255, 0.12);
}
</style>
