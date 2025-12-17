<template>
  <q-page class="q-pa-md">
    <h3 class="q-mb-none q-mt-sm">Настройки профиля</h3>
    <div class="row items-center q-mt-md q-gutter-md justify-between">
      <ProfilePreview />
      <div v-if="ny" class="profile-tree-wrapper">
        <q-img
          style="width: 150px;"
          fit="contain"
          :src="newYearTree"
        />
      </div>
    </div>
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
//icons
import newYearTree from 'src/assets/newYearTree.svg';
//stores
import { useUtilsStore } from 'src/stores/utils-store';
import { storeToRefs } from 'pinia';

const { listTabs, profileSettingsTab, setTab, isLoadingComponent } =
  useProfileTabs();
useUserLoadInfo();
useMetadataTitle();

const utilsStore = useUtilsStore();

//storesToRefs
const { ny } = storeToRefs(utilsStore);
</script>

<style scoped lang="scss">
.profile-tree-wrapper {
  width: 25%;
}
@media (max-width: 720px) {
  .profile-tree-wrapper {
    display: none;
  }
}
</style>
