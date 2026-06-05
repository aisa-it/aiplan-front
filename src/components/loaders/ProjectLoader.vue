<template>
  <div tabindex="-1" class="column flex-center primary-loader">
    <DefaultLoader />
  </div>
</template>

<script setup lang="ts">
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
</script>

<style lang="scss" scoped>
.primary-loader {
  height: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
  position: fixed;
  margin: 0;
  overflow: hidden;
  bottom: 0;
  z-index: 1001;
  overscroll-behavior: contain;
}
</style>
