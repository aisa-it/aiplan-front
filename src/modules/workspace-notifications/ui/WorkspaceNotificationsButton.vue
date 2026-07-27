<template>
  <v-badge :model-value="!!count" :content="count" color="error" floating>
    <v-btn icon size="small" variant="text" :ripple="false" class="header-icon-btn">
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

<style scoped>
.header-icon-btn {
  border: 1px solid #dde2ea;
  border-radius: 8px !important;
  background: transparent !important;
  color: #474a52 !important;
}
</style>
