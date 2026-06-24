<template>
  <q-item
    class="nav-popup__item"
    clickable
    v-ripple
    :to="to"
    @click="$emit('select')"
  >
    <q-item-section v-if="logo" avatar>
      <q-img :src="getUrlFile(logo)" class="nav-popup__item-logo" />
    </q-item-section>

    <q-item-section v-else-if="emoji" avatar>
      {{ String.fromCodePoint(parseInt(emoji)) }}
    </q-item-section>

    <q-item-section v-else avatar>
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
        <span v-if="subtitle" class="nav-popup__item-subtitle">
          ({{ subtitle }})
        </span>
      </q-item-label>
    </q-item-section>
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
}>();

defineEmits<{
  (e: 'select'): void;
}>();
</script>
