<template>
  <BaseNotificationsSettingsDialog
    :settings-list="settingsList"
    :get-user-settings="getUserSettings"
    :save-user-settings="saveUserSettings"
  >
    <template #header>
      <h6 class="q-mb-sm q-mt-sm">
        Настройка уведомлений проекта "{{ project.name }}"
      </h6>
    </template>
  </BaseNotificationsSettingsDialog>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useProjectStore } from 'src/stores/project-store';

import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import BaseNotificationsSettingsDialog from './NotificationsSettings/BaseNotificationsSettingsDialog.vue';

import { settingsList } from './NotificationsSettings/projectNotificationsConfig';

const props = defineProps<{ project: DtoProjectLight }>();
const route = useRoute();

const projectStore = useProjectStore();

const getUserSettings = async () => {
  if (!props.project?.id) return;

  return projectStore.getMeInProject(
    route.params.workspace as string,
    props.project?.id,
  );
};

const saveUserSettings = async (settings: any) => {
  return projectStore.setProjectNotificationSettings(
    route.params.workspace as string,
    props.project?.id ?? '',
    settings,
  );
};
</script>
