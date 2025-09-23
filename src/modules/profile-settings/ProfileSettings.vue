<template>
  <q-page class="q-pa-md">
    <h3 class="q-mb-none q-mt-sm">Настройки профиля</h3>
    <ProfilePreview />
    <SettingsTabs
      :current-tab="profileSettingsTab"
      :list-tabs="listTabs"
      @set="(val: number) => setTab(val)"
    />

    <div
      class="column flex-center"
      style="width: 100%; height: calc(100vh - 300px)"
      v-if="isLoadingComponent"
    >
      <DefaultLoader class="self-center q-mt-md q-mb-md" />
    </div>

    <component v-else :is="listTabs[profileSettingsTab].component" />
  </q-page>
</template>

<script setup lang="ts">
// components
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import ProfilePreview from './components/ProfilePreview.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
// composables
import { useProfileTabs } from './composables/useProfileTabs';
import { useMetadataTitle } from './composables/useMetadataTitle';
import { useUserLoadInfo } from './composables/useUserLoadInfo';

const { listTabs, profileSettingsTab, setTab, isLoadingComponent } =
  useProfileTabs();
useUserLoadInfo();
useMetadataTitle();
</script>

<style scoped lang="scss"></style>
