<template>
  <LoadPage v-if="loading" />
  <div v-else>
    <h3 class="q-mb-none q-mt-sm word-wrap">
      Настройки рабочего пространства {{ currentWsInfo?.name ?? '' }}
    </h3>
    <SettingsTabs
      :current-tab="wsSettingsTab"
      :list-tabs="listTabs"
      @set="(val: number) => (wsSettingsTab = val)"
    />
    <component
      :is="activeComponent"
      :currentWsInfo="currentWsInfo || {}"
      :currentWsSlug="currentWsSlug"
      :isInAdminPanel="props.isInAdminPanel"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
// components
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import LoadPage from 'src/pages/LoadPage.vue';
// import {
//   GeneralWorkspaceSettings,
//   MembersWorkspaceSettings,
//   ActivitiesWorkspaceSettings,
//   ActivitiesMapWorkspaceSettings,
//   IntegrationWorkspaceSettings,
// } from 'src/modules/workspace-settings/ui/tabs';

import { useLoad } from 'src/composables/useLoad';

import { useRoute } from 'vue-router';

import { useWorkspaceStore } from 'src/stores/workspace-store';

const route = useRoute();

const workspaceStore = useWorkspaceStore();
const { workspaceInfo: currentWsInfo } = storeToRefs(workspaceStore);

const { loading, onLoad } = useLoad(workspaceStore.getWorkspaceInfo);

const currentWsSlug = computed(() => route.params.workspace as string);

const props = defineProps({
  isInAdminPanel: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});

const wsSettingsTab = ref(0);
const componentTabs = [
  {
    name: 0,
    component: defineAsyncComponent(
      () =>
        import(
          'src/modules/workspace-settings/ui/tabs/GeneralWorkspaceSettings.vue'
        ),
    ),
  },
  {
    name: 1,
    component: defineAsyncComponent(
      () =>
        import(
          'src/modules/workspace-settings/ui/tabs/MembersWorkspaceSettings.vue'
        ),
    ),
  },
  {
    name: 2,
    component: defineAsyncComponent(
      () =>
        import(
          'src/modules/workspace-settings/ui/tabs/ActivitiesWorkspaceSettings.vue'
        ),
    ),
  },
  {
    name: 3,
    component: defineAsyncComponent(
      () =>
        import(
          'src/modules/workspace-settings/ui/tabs/ActivitiesMapWorkspaceSettings.vue'
        ),
    ),
  },
  {
    name: 4,
    component: defineAsyncComponent(
      () =>
        import(
          'src/modules/workspace-settings/ui/tabs/IntegrationWorkspaceSettings.vue'
        ),
    ),
  },
];
const listTabs = [
  {
    name: 0,
    label: 'Основные',
    dataId: 'general-workspace-settings',
  },
  {
    name: 1,
    label: 'Пользователи',
    dataId: 'members-workspace-settings',
  },
  {
    name: 2,
    label: 'Активности',
  },
  {
    name: 3,
    label: 'Статистика',
  },
  {
    name: 4,
    label: 'Интеграции',
    dataId: 'integration-workspace-settings',
  },
];

const activeComponent = computed(
  () =>
    componentTabs.find((tab) => tab.name === wsSettingsTab.value)?.component,
);

onMounted(async () => {
  onLoad(currentWsSlug.value, props.isInAdminPanel);
});
</script>
