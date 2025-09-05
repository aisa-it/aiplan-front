<template>
  <div class="admin-header" :class="{ flex: isFlex }">
    <h6 style="margin: 0 !important">
      {{ title }}
    </h6>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; isFlex?: boolean }>();
</script>

<style scoped>
.flex {
  justify-content: space-between;
}
@media screen and (max-width: 400px) {
  .flex {
    flex-direction: row;
    align-items: center;
  }
}
</style>
