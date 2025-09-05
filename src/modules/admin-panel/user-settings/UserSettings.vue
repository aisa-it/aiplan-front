<template>
  <LoadPage v-if="loading" />
  <q-page v-else class="q-pa-md q-pb-lg">
    <UserInfoSection
      :userName="`${user.last_name} ${user.first_name}`"
      :userEmail="user.email || ''"
    />
    <hr style="color: #aab6ca1f" />

    <SettingsTabs
      :current-tab="activeTab"
      :list-tabs="tabsConfig"
      @set="setActiveTab"
    />
    <component :is="activeComponent" @update:user="execute" :user="user" />
  </q-page>
</template>

<script setup lang="ts">
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import LoadPage from 'src/pages/LoadPage.vue';
import UserInfoSection from './ui/UserInfoSection.vue';

import { USER_SETTINGS_TABS } from './tabsConfig';
import { useUserSettings } from './composables/useUserSettings';
import { useTabs } from './composables/useTabs';

const { activeTab, activeComponent, setActiveTab, tabsConfig } =
  useTabs(USER_SETTINGS_TABS);

const { data: user, loading, execute } = useUserSettings();
</script>
