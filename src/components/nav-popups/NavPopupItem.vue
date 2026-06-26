<template>
  <q-item
    clickable
    v-ripple
    :to="to"
    :active="active"
    active-class="nav-popup__item--active text-weight-medium"
    @click="$emit('select')"
  >
    <q-item-section v-if="logo" side class="q-pr-sm">
      <q-avatar size="sm" rounded>
        <q-img :src="getUrlFile(logo)" />
      </q-avatar>
    </q-item-section>

    <q-item-section v-else-if="emoji" side class="q-pr-sm">
      <q-avatar size="sm">
        {{ String.fromCodePoint(parseInt(emoji)) }}
      </q-avatar>
    </q-item-section>

    <q-item-section v-else side class="q-pr-sm">
      <AvatarImage
        :text="title[0]?.toUpperCase() ?? '?'"
        :tooltip="title"
        :rounded="false"
        size="24px"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="ellipsis">
        {{ title }}
        <span v-if="subtitle" class="text-caption text-grey-7 q-ml-xs">
          ({{ subtitle }})
        </span>
      </q-item-label>
    </q-item-section>
    <slot />
  </q-item>
</template>

<script setup lang="ts">
import AvatarImage from 'src/components/AvatarImage.vue';
import { getUrlFile } from 'src/utils/helpers';

defineProps<{
  title: string;
  subtitle?: string;
  emoji?: string | null;
  logo?: string | null;
  to?: string;
  active?: boolean;
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>
