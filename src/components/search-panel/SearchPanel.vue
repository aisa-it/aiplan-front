<template>
  <div class="extended-search-wrapper">
    <q-img
      v-if="ny"
      fit="contain"
      :src="newYearTree"
      style="width: 38px; height: 32px"
    />
    <q-img
      v-if="wd && !q.platform.is.mobile"
      fit="contain"
      :src="womanDayText"
      style="width: 83px; height: 32px"
    />
    <q-btn
      v-if="isEnabledJitsi"
      flat
      dense
      class="btn-only-icon-sm bordered"
      @click="() => openConference()"
      data-tour="conference"
    >
      <ConferenceIcon /><q-tooltip>Конференция</q-tooltip></q-btn
    >
    <WorkspaceNotifications />
    <SearchButton />
    <NewIssue v-if="!route.path.includes('admin-panel')" />
    <ProfileButton data-id="profile-button-search-panel" data-tour="profile" />
  </div>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

// components
import ProfileButton from 'src/components/ProfileButton.vue';
import NewIssue from 'src/components/NewIssue.vue';
import WorkspaceNotifications from 'src/modules/workspace-notifications/ui/WorkspaceNotifications.vue';
import SearchButton from 'src/components/search-panel/SearchButton.vue';
import ConferenceIcon from '../icons/ConferenceIcon.vue';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
//icons
import newYearTree from 'src/assets/newYearTree.svg';
import womanDayText from 'src/assets/woman-day-text.png';

const route = useRoute();

const utilsStore = useUtilsStore();

const q = useQuasar();

//storesToRefs
const { isEnabledJitsi } = storeToRefs(utilsStore);
const { ny, wd } = storeToRefs(utilsStore);

function openConference() {
  window.open(`/conf/`);
}
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
