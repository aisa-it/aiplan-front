<template>
  <div tabindex="-1" class="column flex-center primary-loader">
    <DefaultLoader />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

export default defineComponent({
  name: 'PrimaryLoader',
  components: { DefaultLoader },
});
</script>
<style lang="scss" scoped>
.primary-loader {
  // height: -moz-available; /* WebKit игнор. */
  // height: -webkit-fill-available; /* Mozilla игнор. */
  // height: fill-available;
  height: calc(100% - 50px);
  width: 100%;
  position: fixed;
  margin: 0;
  overflow: hidden;
  bottom: 0;
  z-index: 1001;
  overscroll-behavior: contain;
}
</style>
