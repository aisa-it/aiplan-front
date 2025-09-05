<template>
  <div class="extended-search-wrapper">
    <WorkspaceNotifications />
    <SearchButton />
    <NewIssue v-if="!route.path.includes('admin-panel')" />
    <ProfileButton data-id="profile-button-search-panel" />
  </div>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';

// components
import ProfileButton from 'src/components/ProfileButton.vue';
import NewIssue from 'src/components/NewIssue.vue';
import WorkspaceNotifications from 'src/modules/workspace-notifications/ui/WorkspaceNotifications.vue';
import SearchButton from 'src/components/search-panel/SearchButton.vue';

const route = useRoute();







</script>

<style scoped lang="scss">
.extended-search-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
}
</style>
