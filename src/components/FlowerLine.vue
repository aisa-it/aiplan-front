<template>
  <div class="flower-line" />
</template>

<style lang="scss" scoped>
.flower-line {
  width: 100%;
  height: 40px;
  z-index: 101;
  pointer-events: none;

  background-image: url('src/assets/patterns/pattern_flower.svg');
  background-repeat: repeat-x;
  background-position: top left;
  background-size: 174.88px 40px;
  background-color: $bg-color;
}
</style>
