<template>
  <span
    class="issue-column-resizer"
    @pointerdown.stop.prevent="emit('start', $event)"
    @click.stop
    @dblclick.stop.prevent="emit('reset')"
  />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  start: [PointerEvent];
  reset: [];
}>();
</script>

<style scoped>
.issue-column-resizer {
  position: absolute;
  inset-block: 0;
  right: 0;
  width: 8px;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  z-index: 1;
}

.issue-column-resizer::after {
  content: '';
  position: absolute;
  top: 25%;
  bottom: 25%;
  right: 3px;
  width: 2px;
  border-radius: 1px;
  background: rgba(var(--v-theme-on-background), 0.2);
  opacity: 0;
  transition: opacity 150ms;
}

.issue-column-resizer:hover::after {
  opacity: 1;
  background: rgb(var(--v-theme-primary));
}

@media (pointer: coarse) {
  .issue-column-resizer {
    display: none;
  }
}
</style>
