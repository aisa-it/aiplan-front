<template>
  <v-app-bar flat border="b" height="50">
    <v-app-bar-title></v-app-bar-title>
    <template #append>
      <SearchPanel />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import SearchPanel from '@/components/search-panel/SearchPanel.vue'
</script>
