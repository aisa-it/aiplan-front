<template>
  <div class="search-panel d-flex align-center ga-2">
    <ConferenceButton />
    <WorkspaceNotificationsButton />
    <SearchButton />
    <NewIssue />
    <ProfileButton />
  </div>
</template>

<script setup lang="ts">
import NewIssue from '@/components/NewIssue.vue'
import ProfileButton from '@/components/ProfileButton.vue'
import ConferenceButton from '@/components/search-panel/ConferenceButton.vue'
import SearchButton from '@/components/search-panel/SearchButton.vue'
import WorkspaceNotificationsButton from '@/modules/workspace-notifications/ui/WorkspaceNotificationsButton.vue'
</script>

<style scoped>
.search-panel {
  padding-right: 8px;
}
</style>
