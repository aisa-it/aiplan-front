<template>
  <div class="flex items-center gap-2 pr-2">
    <ConferenceButton />
    <WorkspaceNotificationsButton />
    <SearchButton />
    <NewIssue />
    <ProfileButton
      @sign-out="AuthService.signOut()"
      @sign-out-everywhere="AuthService.signOutEverywhere()"
    />
  </div>
</template>

<script setup lang="ts">
import ProfileButton from '@/components/ProfileButton.vue'
import ConferenceButton from './components/ConferenceButton.vue'
import NewIssue from './components/NewIssue.vue'
import SearchButton from './components/SearchButton.vue'
import WorkspaceNotificationsButton from './components/WorkspaceNotificationsButton.vue'
import { AuthService } from '@/modules/auth/api/auth.service';
</script>
