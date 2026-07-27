<template>
  <v-btn icon variant="text" :ripple="false" class="header-icon-btn">
    <ConferenceIcon />
  </v-btn>
</template>

<script setup lang="ts">
import ConferenceIcon from '@/components/icons/ConferenceIcon.vue'
</script>

<style scoped>
.header-icon-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  border: 1px solid #dde2ea;
  border-radius: 8px !important;
  background: transparent !important;
  color: #474a52 !important;
}
</style>
