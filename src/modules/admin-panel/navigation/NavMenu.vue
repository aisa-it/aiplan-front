<template>
  <NavHeader />
  <NavList :links="NAV_ITEMS" :base_path="BASE_PATH" />
</template>

<script setup lang="ts">
import NavHeader from './components/NavHeader.vue';
import NavList from './components/NavList.vue';
import { NAV_ITEMS, BASE_PATH } from './config';
</script>
