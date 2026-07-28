<template>
  <v-avatar ::size="size" class="relative rounded-lg text-white">
    <v-img v-if="image" :src="getUrlFile(image)" cover>
      <template #error>
        <AvatarFallback :text="error || text" />
      </template>
    </v-img>

    <AvatarFallback v-else :text="text" />

    <HatXmasIcon
      v-if="ny"
      class="pointer-events-none absolute z-10 left-[40%] top-[-55%] w-full -translate-x-1/2 -translate-y-1/2 scale-[0.7]"
      :class="{
        'drop-shadow-[-3px_-1px_4px_rgba(0,0,0,0.7)]': theme === 'light',
      }"
      :width="44"
      :height="44"
    />
  </v-avatar>
</template>

<script setup lang="ts">
import { getUrlFile } from '../../utils/helpers';

import HatXmasIcon from '../../icons/HatXmasIcon.vue';
import AvatarFallback from './AvatarFallback.vue';

withDefaults(
  defineProps<{
    image?: string | null | undefined;
    text?: string;
    error?: string;
    theme?: string;
    ny?: boolean;
    size?: number | string;
  }>(),
  {
    theme: 'light',
    ny: false,
    size: 38,
  },
);
</script>
