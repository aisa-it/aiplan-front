<template>
  <NavMenuHeader />
  <div
    class="nav-menu-bottom-bar"
    data-tour="sidebar"
    style="height: calc(100vh - 50px)"
  >
    <ExpansionGroup></ExpansionGroup>
  </div>
</template>

<script lang="ts" setup>
// nav menu components
import ExpansionGroup from 'src/components/ExpansionGroup.vue';
import NavMenuHeader from './menu/NavMenuHeader.vue';
</script>
