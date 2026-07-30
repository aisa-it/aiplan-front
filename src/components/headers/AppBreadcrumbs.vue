<template>
  <v-breadcrumbs
    v-if="items.length"
    :items="vuetifyItems"
    divider="/"
    class="app-breadcrumbs"
  >
    <template #title="{ item }">
      <span class="breadcrumbs-title">
        <HomeIcon
          v-if="item.icon === 'home'"
          :width="20"
          :height="20"
          class="shrink-0"
        />
        <span class="truncate">{{ item.title }}</span>
      </span>
    </template>
  </v-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'
import type { BreadcrumbItem } from '@/composables/useBreadcrumbs'

const { items } = useBreadcrumbs()

const vuetifyItems = computed(() =>
  items.value.map((item: BreadcrumbItem, index) => ({
    ...item,
    disabled: index === items.value.length - 1 || !item.to,
  })),
)
</script>
