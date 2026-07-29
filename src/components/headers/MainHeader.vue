<template>
  <v-app-bar flat border="b" height="50">
    <WorkspaceButton />
    <template #append>
      <SearchPanel />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import SearchPanel from '@/components/search-panel/SearchPanel.vue'
import WorkspaceButton from '@/components/select-workspace/WorkspaceButton.vue'
</script>
