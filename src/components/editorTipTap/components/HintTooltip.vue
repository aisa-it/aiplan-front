<template>
  <v-tooltip
    activator="parent"
    location="bottom"
    content-class="hint-tooltip"
    :open-delay="isMobile ? 500 : 0"
    :close-delay="isMobile ? 1000 : 0"
  >
    <slot />
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const { width } = useDisplay();
const isMobile = computed(() => width.value <= 650);
</script>

<style lang="scss">
.v-overlay__content.hint-tooltip {
  background: #616161 !important;
  color: #fafafa !important;
  font-size: 10px !important;
  font-weight: 400 !important;
  line-height: 1.25 !important;
  padding: 6px 10px !important;
  border-radius: 4px !important;
}
</style>
