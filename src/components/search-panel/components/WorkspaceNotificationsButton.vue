<template>
  <v-badge :model-value="!!count" :content="count" color="error" floating>
    <v-btn icon variant="text" :ripple="false" class="header-icon-btn">
      <BellIcon />
    </v-btn>
  </v-badge>
</template>

<script setup lang="ts">
import BellIcon from '@/components/icons/BellIcon.vue'

withDefaults(
  defineProps<{
    count?: number
  }>(),
  { count: 0 },
)
</script>
