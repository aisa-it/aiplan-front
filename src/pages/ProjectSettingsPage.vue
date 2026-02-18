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

      <div
        class="column flex-center"
        style="width: 100%; height: calc(100vh - 300px)"
        v-if="isLoadingComponent"
      >
        <DefaultLoader class="self-center q-mt-md q-mb-md" />
      </div>

      <component v-else :is="activeTab" @update="projectInfoRefresh" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
// core
import { useMeta } from 'quasar';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';

// stores
import { useRolesStore } from 'stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import LoadPage from './LoadPage.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import SettingsTabs from 'src/shared/components/SettingsTabs.vue';

// stores
const projectStore = useProjectStore();

const { hasPermissionByProject } = useRolesStore();

const { roles } = storeToRefs(useRolesStore());

// store to refs
const { project } = storeToRefs(projectStore);

// tabs
const projectSettingsTab = ref(0);

const route = useRoute();

const metadata = ref({ title: 'Загрузка...' });

const isLoadingComponent = ref(false);

function asyncImport(loader: () => Promise<any>) {
  return defineAsyncComponent(async () => {
    isLoadingComponent.value = true;

    const component = await loader();

    isLoadingComponent.value = false;
    return component;
  });
}

const activeTab = computed(() => {
  switch (projectSettingsTab.value) {
    case 1:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/control/ui/ControlProjectSettings.vue'
          ),
      );
    case 2:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/members/ui/MembersProjectSettings.vue'
          ),
      );
    case 3:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/states/ui/StatesProjectSettings.vue'
          ),
      );
    case 4:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/labels/ui/LabelsProjectSettings.vue'
          ),
      );
    case 5:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/rules/ui/RulesProjectSettings.vue'
          ),
      );
    case 6:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/activities/ui/ActivitiesProjectSettings.vue'
          ),
      );
    case 7:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/new-issue-template/ui/NewIssueTemplate.vue'
          ),
      );
    case 8:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/custom-properties/ui/CustomPropertiesSettings.vue'
          ),
      );
    default:
      return asyncImport(
        () =>
          import(
            'src/modules/project-settings/general/ui/GeneralProjectSettings.vue'
          ),
      );
  }
});

const listTabs = computed(() => {
  const tabs = [
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
    {
      name: 8,
      label: 'Параметры',
      allowedRoles: ['owner', 'admin'],
    },
  ];

  return tabs.filter((tab) => {
    if (tab.allowedRoles) {
      return tab.allowedRoles.includes(roles.value.project);
    }
    return true;
  });
});

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

onMounted(() => {
  projectInfoRefresh();
});
</script>
