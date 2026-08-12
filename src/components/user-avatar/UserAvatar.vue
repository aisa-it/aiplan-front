<template>
  <div class="relative">
    <v-avatar :size="AVATAR_SIZES[size]" class="text-white" :class="roundClass">
      <v-img v-if="user.avatar_id" :src="getUrlFile(user.avatar_id)" cover>
        <template #error>
          <AvatarFallback
            :text="avatarText"
            :class="FALLBACK_TEXT_SIZE[size]"
          />
        </template>
      </v-img>

      <AvatarFallback
        v-else
        :text="avatarText"
        :class="FALLBACK_TEXT_SIZE[size]"
      />
    </v-avatar>
    <HatXmasIcon
      v-if="ny && !noHat"
      class="pointer-events-none absolute z-10 left-[85%] top-[-5%] w-full -translate-x-1/2 -translate-y-1/2 scale-[1.4]"
      :class="{
        'drop-shadow-[-3px_-1px_4px_rgba(0,0,0,0.7)]': !isDark,
      }"
      :width="proportionHat"
      :height="proportionHat"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useAppTheme } from '@/composables/useAppTheme.ts';
import { getUrlFile } from '@/utils/helpers.ts';

import AvatarFallback from './components/AvatarFallback.vue';
import HatXmasIcon from '@/components/icons/HatXmasIcon.vue';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts.ts';

import {
  type DisplayOptions,
  DEFAULT_OPTIONS,
  AVATAR_SIZES,
  FALLBACK_TEXT_SIZE,
} from './UserAvatar.config.ts';

const props = withDefaults(
  defineProps<
    {
      user: DtoUser;
    } & DisplayOptions
  >(),
  DEFAULT_OPTIONS,
);

const proportionHat = ref(AVATAR_SIZES[props.size]);

const { isDark } = useAppTheme();

const avatarText = computed(() =>
  [props.user.last_name?.[0], props.user.first_name?.[0]]
    .filter(Boolean)
    .join(['extralarge', 'large'].includes(props.size) ? ' ' : '')
    .toUpperCase(),
);

const roundClass = computed(() =>
  props.rounded ? 'rounded-full' : 'rounded-lg',
);

import { useUtilsStore } from '@/stores/utils-store';
import { storeToRefs } from 'pinia';

const utilsStore = useUtilsStore();
const { ny } = storeToRefs(utilsStore);
</script>
