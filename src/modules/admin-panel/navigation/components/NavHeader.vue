<template>
  <NavHeader :title="'Настройки'" :url="`/${user?.last_workspace_slug}`" />
</template>

<script setup lang="ts">
import NavHeader from '../ui/NavHeader.vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>
