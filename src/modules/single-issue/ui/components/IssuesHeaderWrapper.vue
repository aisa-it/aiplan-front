<template>
  <q-item class="column issues-header-wrapper">
    <q-item-section>
      <div class="flex no-wrap items-center justify-between">
        <slot></slot>
      </div>
    </q-item-section>
  </q-item>
</template>
<style scoped lang="scss">
.issues-header-wrapper {
  gap: 10px;
  width: 100%;
  padding: 0px !important;
}
</style>
