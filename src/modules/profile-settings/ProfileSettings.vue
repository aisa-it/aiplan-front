<template>
  <q-page class="q-pa-md">
    <h3 class="q-mb-none q-mt-sm">Настройки профиля</h3>
    <ProfilePreview />
    <SettingsTabs
      :current-tab="profileSettingsTab"
      :list-tabs="listTabs"
      @set="(val: number) => setTab(val)"
    />

    <GeneralProfileSettings v-if="profileSettingsTab === 0" />
    <ActivitiesProfileSettings v-else-if="profileSettingsTab === 1" />
    <DesignProfileSettings v-else-if="profileSettingsTab === 2" />
  </q-page>
</template>

<script setup lang="ts">
// components
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import GeneralProfileSettings from './components/GeneralProfileSettings.vue';
import ActivitiesProfileSettings from './components/ActivitiesProfileSettings.vue';
import DesignProfileSettings from './components/DesignProfileSettings.vue';
import ProfilePreview from './components/ProfilePreview.vue';
// composables
import { useProfileTabs } from './composables/useProfileTabs';
import { useMetadataTitle } from './composables/useMetadataTitle';
import { useUserLoadInfo } from './composables/useUserLoadInfo';

const { listTabs, profileSettingsTab, setTab } = useProfileTabs();
useUserLoadInfo();
useMetadataTitle();
</script>

<style scoped lang="scss"></style>
