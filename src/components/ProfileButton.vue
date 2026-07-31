<template>
  <v-btn icon variant="text" rounded="lg" :ripple="false" class="profile-btn">
    <UserAvatar :user="user" :rounded="false" />

    <v-menu activator="parent" location="bottom end" :offset="4">
      <v-list min-width="200" rounded="lg">
        <v-list-item title="Профиль" @click="$router.push('/profile')" />
        <v-list-item title="Админ. панель" />
        <v-divider />
        <v-list-item title="Выйти" base-color="error" />
        <v-list-item title="Выйти из всех сессий" base-color="error" />
      </v-list>
    </v-menu>
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserAvatar from './user-avatar/UserAvatar.vue';
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// TODO: Достаем из user-store, когда появится
const user = ref<DtoUser>({
  id: 'e0dfe559-88af-48c4-931c-4cdc88b2d057',
  username: 'dmitriy.zheleznev',
  email: 'dmitriy.zheleznev@aisa.ru',
  first_name: 'Дмитрий',
  last_name: 'Железнев',
  avatar: '',
  // avatar_id: 'b6b0c82f-a307-444d-8690-70c6cecd25fb', Проверка на изображении
  avatar_id: null,
  user_timezone: 'Europe/Moscow',
  last_active: '2026-07-28T12:13:19.938469439+03:00',
  status_emoji: '🍽️',
  status: 'Обед',
  status_end_date: '2026-07-31T10:31:11.276Z',
  created_at: '2025-07-14T15:18:20.087072+03:00',
  is_superuser: false,
  is_active: true,
  blocked_until: undefined,
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
      states: undefined,
      workspaces: undefined,
      projects: undefined,
      assignedToMe: false,
      watchedToMe: false,
      authoredToMe: false,
    },
    group_tables_hide: undefined,
    columns_to_show: undefined,
    draft: false,
  },
  settings: {
    deadline_notification: 86400000000000,
    telegram_notification_mute: false,
    email_notification_mute: false,
    app_notification_mute: false,
  },
  tutorial: 2,
  last_workspace_id: undefined,
  last_workspace_slug: 'new',
  notification_count: 364,
});
</script>
