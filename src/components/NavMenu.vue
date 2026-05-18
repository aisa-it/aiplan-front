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

<script setup lang="ts">
import ExpansionGroup from 'src/components/ExpansionGroup.vue';
import NavMenuHeader from './menu/NavMenuHeader.vue';
</script>
