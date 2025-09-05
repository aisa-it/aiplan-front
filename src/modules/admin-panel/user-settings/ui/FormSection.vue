<template>
  <div class="row mobile-block">
    <div class="col">
      <h4 class="text-h6 font-semibold text-brand-base">{{ title }}</h4>
    </div>
    <div class="col q-mt-xs">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
