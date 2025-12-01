<template>
  <BaseNotificationsSettingsDialog
    :settings-list="settingsList"
    :get-user-settings="getUserSettings"
    :save-user-settings="saveUserSettings"
  >
    <template #header>
      <h6 class="q-mb-sm q-mt-sm">
        Настройка уведомлений пространства "{{
          props.workspace.name
        }}"
      </h6>
    </template>
  </BaseNotificationsSettingsDialog>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from 'src/stores/workspace-store';

import BaseNotificationsSettingsDialog from './NotificationsSettings/BaseNotificationsSettingsDialog.vue';

import { settingsList } from './NotificationsSettings/workspaceNotificationsConfig';
import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  workspace: DtoWorkspaceWithCount;
}>();


const workspaceStore = useWorkspaceStore()

const getUserSettings = async () => {
  if (!props.workspace.slug) return;

  return workspaceStore.getWorkspaceNotifications(
    props.workspace.slug as string,
  );
};

const saveUserSettings = async (settings: any) => {
  return workspaceStore.setAiDocNotificationSettings(
    props.workspace.slug as string,
    settings,
  );
};
</script>
