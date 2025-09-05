<template>
  <q-list>
    <q-item
      v-for="link in links"
      :key="link.slug"
      class="centered-horisontally"
      clickable
      :active="
        currentSlug === link.slug || link.add_active?.includes(currentSlug)
      "
      :to="`${base_path}/${link.slug}`"
    >
      {{ link.label }}
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useCurrentSlug } from '../composables/useCurrentSlug';
import { INavItem } from '../interfaces/adminNavList';

const { currentSlug } = useCurrentSlug();

defineProps<{ links: INavItem[]; base_path: string }>();
</script>

<style scoped></style>
