<template>
  <div class="nav-popup-section">
    <div class="nav-popup__section-title">
      {{ title }}
    </div>
    <div class="nav-popup__section-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
