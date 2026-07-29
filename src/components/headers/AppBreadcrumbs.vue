<template>
  <nav
    v-if="items.length"
    class="ml-4 flex min-w-0 items-center overflow-x-auto text-[14px] font-extrabold text-[#474a52]"
  >
    <template v-for="(item, index) in items" :key="`${item.title}-${index}`">
      <span v-if="index > 0" class="mx-2 shrink-0 select-none">/</span>

      <component
        :is="item.to ? 'router-link' : 'span'"
        :to="item.to"
        class="breadcrumbs-title inline-flex min-w-0 items-center gap-1 no-underline"
        :class="item.to ? 'cursor-pointer text-[#474a52]' : 'text-[#474a52]'"
      >
        <HomeIcon
          v-if="item.icon === 'home'"
          :width="20"
          :height="20"
          class="shrink-0"
        />
        <span class="truncate">{{ item.title }}</span>
      </component>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useBreadcrumbs } from '@/composables/useBreadcrumbs'

import HomeIcon from '@/components/icons/HomeIcon.vue'

const { items } = useBreadcrumbs()
</script>

<style scoped>
.breadcrumbs-title {
  max-width: 240px;
}
</style>
