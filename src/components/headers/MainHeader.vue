<template>
  <v-app-bar flat border="b" height="50">
    <AppBreadcrumbs />
    <template #append>
      <SearchPanel />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import AppBreadcrumbs from '@/components/headers/AppBreadcrumbs.vue'
import SearchPanel from '@/components/search-panel/SearchPanel.vue'
</script>
