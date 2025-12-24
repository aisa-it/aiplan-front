<template>
  <div class="limit-card elevator-1">
    <p class="limit-card__category text-lg font-semibold text-brand-base">
      Категория
    </p>
    <ProgressBar :current-value="4" :max-value="10" />
  </div>
</template>

<script setup lang="ts">
import ProgressBar from './ProgressBar.vue';
</script>

<style scoped lang="scss">
.limit-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid var(--dark-border-color);
  border-radius: 16px;
}
</style>
