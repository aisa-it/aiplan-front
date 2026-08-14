<template>
  <main class="w-full p-4 sm:p-6">
    <h3 class="mt-2 mb-0 text-5xl">Настройки профиля</h3>

    <div class="relative">
      <div class="my-4 flex items-center justify-between gap-4">
        <ProfilePreview :user="user" />
      </div>

      <v-tabs v-model="profileSettingsTab" color="primary">
        <v-tab
          v-for="tab in listTabs"
          :key="tab.name"
          :value="tab.name"
        >
          {{ tab.label }}
        </v-tab>
      </v-tabs>
    </div>

    <template v-for="tab in listTabs" :key="tab.name">
      <component
        :is="tab.component"
        v-if="tab.name === profileSettingsTab && tab.component"
        :user="user"
        @update-user="updateMockUser"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ProfilePreview from '../components/ProfilePreview.vue';
import { useProfileTabs } from '../composables/useProfileTabs';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const { listTabs, profileSettingsTab } = useProfileTabs();

// TODO: заменить мок на user-store после подключения авторизации.
const user = ref<DtoUser>({
  id: 'e0dfe559-88af-48c4-931c-4cdc88b2d057',
  username: 'dmitriy.zheleznev',
  email: 'dmitriy.zheleznev@aisa.ru',
  first_name: 'Дмитрий',
  last_name: 'Железнев',
  avatar: '',
  avatar_id: null,
  user_timezone: 'Europe/Moscow',
  last_active: '2026-07-28T12:13:19.938469439+03:00',
  status_emoji: '🍽️',
  status: 'Обед',
  status_end_date: '2026-07-31T10:31:11.276Z',
  created_at: '2025-07-14T15:18:20.087072+03:00',
  is_superuser: false,
  is_active: true,
  is_onboarded: true,
  is_bot: false,
  is_integration: false,
  theme: {
    system: false,
    dark: false,
    contrast: false,
    open_in_new: false,
  },
  view_props: {
    showEmptyGroups: false,
    hideSubIssues: false,
    showOnlyActive: false,
    autoSave: false,
    issueView: 'gantt_chart',
    filters: {
      orderDesc: false,
      assignedToMe: false,
      watchedToMe: false,
      authoredToMe: false,
    },
    draft: false,
  },
  settings: {
    deadline_notification: 86400000000000,
    telegram_notification_mute: false,
    email_notification_mute: false,
    app_notification_mute: false,
  },
  tutorial: 2,
  last_workspace_slug: 'new',
  notification_count: 364,
});

const updateMockUser = (data: Partial<DtoUser>) => {
  user.value = { ...user.value, ...data };
};
</script>
