<template>
  <v-btn icon size="small" variant="text" :ripple="false" class="header-icon-btn">
    <ConferenceIcon />
  </v-btn>
</template>

<script setup lang="ts">
import ConferenceIcon from '@/components/icons/ConferenceIcon.vue'
</script>

<style scoped>
.header-icon-btn {
  border: 1px solid #dde2ea;
  border-radius: 8px !important;
  background: transparent !important;
  color: #474a52 !important;
}
</style>
