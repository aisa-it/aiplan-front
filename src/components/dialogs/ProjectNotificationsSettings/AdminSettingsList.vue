<template>
  <q-card class="setting-card">
    <div class="sub-text q-ml-sm q-my-sm"><slot name="subtitle"></slot></div>
    <div class="notification-header">
      <span style="font-size: 14px; font-weight: 600">Название</span>
      <span style="text-align: center">Включить</span>
    </div>
    <div class="notification-list">
      <div class="notification-setting">
        <span class="centered-horisontally">Все</span>
        <q-checkbox
          class="justify-center"
          :model-value="allSettings"
          @update:model-value="(value: boolean) => setAll(!value)"
        />
      </div>
      <div
        class="notification-setting"
        v-for="setting in settingsList"
        :key="setting.title"
      >
        <span>{{ setting.title }}</span>
        <q-checkbox
          class="justify-center"
          :model-value="!settings[setting.field]"
          @update:model-value="
            (value: boolean) =>
              emits('update', { field: setting.field, value: !value })
          "
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ settings: any }>();
const emits = defineEmits<{ update: [{ field: string; value: boolean }] }>();

const settingsList = [
  { title: 'Изменилось название', field: 'disable_project_name' },
  { title: 'Изменилась иконка', field: 'disable_project_logo' },
  { title: 'Изменился идентификатор', field: 'disable_project_identifier' },
  { title: 'Изменилась приватность', field: 'disable_project_public' },
  { title: 'Изменился лидер проекта', field: 'disable_project_owner' },
  {
    title: 'Изменился исполнитель по умолчанию',
    field: 'disable_project_default_assignee',
  },
  {
    title: 'Изменился наблюдатель по умолчанию',
    field: 'disable_project_default_watcher',
  },
  { title: 'Добавлен/Убран пользователь', field: 'disable_project_member' },
  { title: 'Изменилась роль пользователя', field: 'disable_project_role' },
  { title: 'Изменились статусы проекта', field: 'disable_project_status' },
  { title: 'Изменились теги проекта', field: 'disable_project_label' },
];

const allSettings = computed(() =>
  settingsList.every((el) => !props.settings[el.field]),
);

const setAll = (value: boolean) => {
  settingsList.forEach((setting) => {
    emits('update', { field: setting.field, value: value });
  });
};
</script>

<style scoped lang="scss">
.notification-setting {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.notification-list {
  max-height: calc(100vh - 400px);
  overflow-y: scroll;
  padding: 0px 8px;
  @media screen and (max-width: 480px) {
    max-height: 30vh;
  }
}
.setting-card {
  box-shadow: none;
}

.notification-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  padding: 0px 8px;
}

.notification-btns {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}

@media screen and (max-width: 480px) {
  .notification-btns {
    flex-direction: column;
    justify-content: center;
    gap: 8px;
  }
  .notification-btn {
    width: 100% !important;
    margin: 0px !important;
  }
}

.notification-setting {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
}
</style>
