<template>
  <q-page class="q-pa-md">
    <WorkspaceSettings :isInAdminPanel="true" />
  </q-page>
</template>

<script setup lang="ts">
import WorkspaceSettings from 'src/modules/workspace-settings/ui/WorkspaceSettings.vue';
</script>
