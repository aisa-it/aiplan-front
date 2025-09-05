<template>
  <div class="underlay">
    <q-linear-progress indeterminate />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadPage',
});
</script>
<style scoped lang="scss">
.underlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 10000;
}

.loader {
  display: flex;
  vertical-align: middle;
  align-items: center;
  text-align: center;
  height: 100vh;

  div {
    width: 100%;
  }
}

:deep(.q-linear-progress) {
  color: $primary !important;
  border: none;
  height: 4px;
}
</style>
