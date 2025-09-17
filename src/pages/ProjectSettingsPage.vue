<template>
  <LoadPage v-if="project === undefined" />
  <q-page v-else class="q-pa-md">
    <div>
      <h3 class="q-mb-none q-mt-sm word-wrap">
        Настройки проекта {{ project?.name ?? '' }}
      </h3>
      <SettingsTabs
        :current-tab="projectSettingsTab"
        :list-tabs="listTabs"
        @set="(val: number) => (projectSettingsTab = val)"
      />
      <component :is="activeTab" @update="projectInfoRefresh" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
// core
import { useMeta } from 'quasar';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

// stores
import { useRolesStore } from 'stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import LoadPage from './LoadPage.vue';
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';
import GeneralProjectSettings from 'src/modules/project-settings/general/ui/GeneralProjectSettings.vue';
import LabelsProjectSettings from 'src/modules/project-settings/labels/ui/LabelsProjectSettings.vue';
import ControlProjectSettings from 'src/modules/project-settings/control/ui/ControlProjectSettings.vue';
import MembersProjectSettings from 'src/modules/project-settings/members/ui/MembersProjectSettings.vue';
import StatesProjectSettings from 'src/modules/project-settings/states/ui/StatesProjectSettings.vue';
import RulesProjectSettings from 'src/modules/project-settings/rules/ui/RulesProjectSettings.vue';
import ActivitiesProjectSettings from 'src/modules/project-settings/activities/ui/ActivitiesProjectSettings.vue';
import NewIssueTemplate from 'src/modules/project-settings/new-issue-template/ui/NewIssueTemplate.vue';

// stores
const projectStore = useProjectStore();

const { hasPermissionByProject } = useRolesStore();

// store to refs
const { project } = storeToRefs(projectStore);

// tabs
const projectSettingsTab = ref(0);

const route = useRoute();

const metadata = ref({ title: 'Загрузка...' });

const activeTab = computed(() => {
  switch (projectSettingsTab.value) {
    case 1:
      return ControlProjectSettings;
    case 2:
      return MembersProjectSettings;
    case 3:
      return StatesProjectSettings;
    case 4:
      return LabelsProjectSettings;
    case 5:
      return RulesProjectSettings;
    case 6:
      return ActivitiesProjectSettings;
    case 7:
      return NewIssueTemplate;
    default:
      return GeneralProjectSettings;
  }
});

const listTabs = [
  {
    name: 0,
    label: 'Основные',
  },
  {
    name: 1,
    label: 'Управление',
  },
  {
    name: 2,
    label: 'Пользователи',
  },
  {
    name: 3,
    label: 'Статусы',
  },
  {
    name: 4,
    label: 'Теги',
  },
  {
    name: 5,
    label: 'Сценарии',
  },
  {
    name: 6,
    label: 'Активности',
  },
  {
    name: 7,
    label: 'Шаблоны задач',
  },
];

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

const projectInfoRefresh = async () => {
  await projectStore
    .getProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
    )
    .then(() => {
      metadata.value.title = `Настройки ${
        project.value?.name ? project.value?.name : ''
      }`;

      // Проверяем есть ли доступ к настройкам проекта
      if (!hasPermissionByProject(project.value, 'project-settings')) {
        window.location.href = '/access-denied';
      }
    });
};

onMounted(async () => {
  performance.mark('маунт прожект сеттингс');
  await projectInfoRefresh();
});
</script>
