<template>
  <!-- ручка ширины колонки в th: stop — чтобы клик по ней не запускал
       сортировку; двойной клик возвращает дефолтную ширину -->
  <span
    class="column-resizer"
    @mousedown.stop.prevent="emits('start', $event)"
    @click.stop
    @dblclick.stop.prevent="emits('reset')"
  />
</template>

<script setup lang="ts">
const emits = defineEmits<{
  start: [MouseEvent];
  reset: [];
}>();
</script>

<style lang="scss" scoped>
// родительский th обязан быть positioned (relative/sticky)
.column-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    top: 25%;
    bottom: 25%;
    right: 3px;
    width: 2px;
    border-radius: 1px;
    background: $color-shadow;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover::after {
    opacity: 1;
    background: var(--q-primary);
  }
}

// на тачах drag ручки — пытка, а место в шапке нужнее
@media (pointer: coarse) {
  .column-resizer {
    display: none;
  }
}
</style>
