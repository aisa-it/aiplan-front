<template>
  <q-dialog ref="dialogRef" v-model="model" @before-show="onLoad()">
    <q-card v-if="loading === false" class="modal-card">
      <q-card-section>
        <h6 class="q-mb-sm q-mt-sm">Настройка уведомлений спринтов</h6>
      </q-card-section>
      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          align="justify"
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="email" :label="'Email'" />
          <q-tab name="tg" :label="'Telegram'" />
          <q-tab name="app" :label="'Система'" />
        </q-tabs>

        <transition name="fade-slide" mode="out-in">
          <q-tab-panels v-model="tab">
            <q-tab-panel style="padding: 8px 0px 0px 0px" name="email">
              <SprintNotificationsSettingList
                :settings-list="sprintSettingsList"
                :author-settings="settings.notification_author_settings_email"
                :member-settings="settings.notification_settings_email"
              >
                <template #subtitle>Настройка уведомлений по почте</template>
              </SprintNotificationsSettingList>
            </q-tab-panel>

            <q-tab-panel style="padding: 8px 0px 0px 0px" name="tg">
              <SprintNotificationsSettingList
                :settings-list="sprintSettingsList"
                :author-settings="settings.notification_author_settings_tg"
                :member-settings="settings.notification_settings_tg"
              >
                <template #subtitle>Настройка уведомлений в Telegram</template>
              </SprintNotificationsSettingList>
            </q-tab-panel>

            <q-tab-panel style="padding: 8px 0px 0px 0px" name="app">
              <SprintNotificationsSettingList
                :settings-list="sprintSettingsList"
                :author-settings="settings.notification_author_settings_app"
                :member-settings="settings.notification_settings_app"
              >
                <template #subtitle>Настройка уведомлений в системе</template>
              </SprintNotificationsSettingList>
            </q-tab-panel>
          </q-tab-panels>
        </transition>
      </q-card-section>
      <q-card-actions class="notification-btns" align="right">
        <q-btn no-caps class="secondary-btn notification-btn" v-close-popup
          >Отмена</q-btn
        >
        <q-btn
          no-caps
          class="primary-btn notification-btn"
          @click="handleSaveSettings()"
          >Сохранить</q-btn
        >
      </q-card-actions>
    </q-card>

    <q-card
      v-else
      style="height: 90vh; width: 100%"
      class="centered-horisontally justify-center"
    >
      <DefaultLoader />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import { useLoad } from 'src/composables/useLoad';
import SprintNotificationsSettingList from './components/SprintNotificationsSettingList.vue';

const model = defineModel({ default: false });
const tab = ref('email');

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { setNotificationView } = useNotificationStore();

const dialogRef = ref();

const sprintSettingsList: any[] = [
  { title: 'Изменилось название', field: 'disable_sprint_name' },
  { title: 'Изменилось описание', field: 'disable_sprint_description' },
  { title: 'Изменение дат спринта', field: 'disable_sprint_date' },
  { title: 'Изменился наблюдатель', field: 'disable_sprint_watcher_list' },
  { title: 'Изменение списка задач', field: 'disable_sprint_issue_list' },
];

const settings = ref<any>({
  notification_author_settings_email: {},
  notification_author_settings_tg: {},
  notification_author_settings_app: {},
  notification_settings_email: {},
  notification_settings_tg: {},
  notification_settings_app: {},
});

const loadSettings = async () => {
  const slug = currentWorkspaceSlug.value as string;
  if (!slug) return;

  await workspaceStore.getWorkspaceNotifications(slug).then((data: any) => {
    if (!data) return;

    settings.value.notification_author_settings_email = {
      ...data.notification_author_settings_email,
    };
    settings.value.notification_author_settings_tg = {
      ...data.notification_author_settings_tg,
    };
    settings.value.notification_author_settings_app = {
      ...data.notification_author_settings_app,
    };
    settings.value.notification_settings_email = {
      ...data.notification_settings_email,
    };
    settings.value.notification_settings_tg = {
      ...data.notification_settings_tg,
    };
    settings.value.notification_settings_app = {
      ...data.notification_settings_app,
    };
  });
};

const handleSaveSettings = async () => {
  const slug = currentWorkspaceSlug.value as string;
  if (!slug) return;

  await workspaceStore
    .setAiDocNotificationSettings(slug, settings.value)
    .then(() => {
      setNotificationView({
        open: true,
        type: 'success',
      });
      dialogRef.value?.hide?.();
      model.value = false;
    });
};

const { loading, onLoad } = useLoad(loadSettings);
</script>

