<template>
  <BaseNotificationsSettingsDialog
    :settings-list="settingsList"
    :get-user-settings="getUserSettings"
    :save-user-settings="saveUserSettings"
  >
    <template #header>
      <h6 class="q-mb-sm q-mt-sm">
        Настройка уведомлений пространства "{{
          workspaceStore?.workspaceInfo?.name
        }}"
      </h6>
    </template>
  </BaseNotificationsSettingsDialog>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import BaseNotificationsSettingsDialog from './NotificationsSettings/BaseNotificationsSettingsDialog.vue';

import { settingsList } from './NotificationsSettings/workspaceNotificationsConfig';
const route = useRoute();

const workspaceStore = useWorkspaceStore();

const getUserSettings = async () => {
  if (!workspaceStore?.workspaceInfo?.id) return;

  return workspaceStore.getWorkspaceNotifications(
    route.params.workspace as string,
  );
};

const saveUserSettings = async (settings: any) => {
  return workspaceStore.setAiDocNotificationSettings(
    route.params.workspace as string,
    settings,
  );
};
</script>
