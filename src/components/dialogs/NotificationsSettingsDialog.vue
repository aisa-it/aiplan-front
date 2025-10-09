<template>
  <q-dialog ref="dialogRef" @before-show="onLoad()">
    <q-card v-if="loading === false" class="modal-card">
      <q-card-section>
        <h6 v-if="props.project" class="q-mb-sm q-mt-sm">
          Настройка уведомлений задач проекта "{{ project.name }}"
        </h6>
        <h6 v-else class="q-mb-sm q-mt-sm">Настройка уведомлений документа</h6>
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
              <SettingList
                v-if="project"
                :project="props.project.id"
                :authorSettings="settings.notification_author_settings_email"
                :memberSettings="settings.notification_settings_email"
                @updateTelegram="
                  (value) =>
                    setCurrentSetting(value, 'notification_settings_email')
                "
                @updateEmail="
                  (value) =>
                    setCurrentSetting(
                      value,
                      'notification_author_settings_email',
                    )
                "
              >
                <template #subtitle>Настройка уведомлений по почте</template>
              </SettingList>
              <AidocNotificationsSettings
                v-else
                :aidoc-author-settings="
                  aidocSettings.notification_author_settings_email
                "
                :aidoc-member-settings="
                  aidocSettings.notification_settings_email
                "
                @updateDocAuthorSettings="
                  (value) =>
                    setCurrentSetting(
                      value,
                      'notification_author_settings_email',
                      'doc',
                    )
                "
                @updateDocMemberSettings="
                  (value) =>
                    setCurrentSetting(
                      value,
                      'notification_settings_email',
                      'doc',
                    )
                "
              >
                <template #subtitle>Настройка уведомлений по почте</template>
              </AidocNotificationsSettings>
            </q-tab-panel>
            <q-tab-panel style="padding: 8px 0px 0px 0px" name="tg">
              <SettingList
                v-if="project"
                :project="props.project.id"
                :authorSettings="settings.notification_author_settings_tg"
                :memberSettings="settings.notification_settings_tg"
                @updateTelegram="
                  (value) =>
                    setCurrentSetting(value, 'notification_settings_tg')
                "
                @updateEmail="
                  (value) =>
                    setCurrentSetting(value, 'notification_author_settings_tg')
                "
              >
                <template #subtitle>Настройка уведомлений в Telegram</template>
              </SettingList>
              <AidocNotificationsSettings
                v-else
                :aidoc-author-settings="
                  aidocSettings.notification_author_settings_tg
                "
                :aidoc-member-settings="aidocSettings.notification_settings_tg"
                @updateDocAuthorSettings="
                  (value) =>
                    setCurrentSetting(
                      value,
                      'notification_author_settings_tg',
                      'doc',
                    )
                "
                @updateDocMemberSettings="
                  (value) =>
                    setCurrentSetting(value, 'notification_settings_tg', 'doc')
                "
              >
                <template #subtitle>Настройка уведомлений в Telegram</template>
              </AidocNotificationsSettings>
            </q-tab-panel>
            <q-tab-panel style="padding: 8px 0px 0px 0px" name="app">
              <SettingList
                v-if="project"
                :project="props.project.id"
                :authorSettings="settings.notification_author_settings_app"
                :memberSettings="settings.notification_settings_app"
                @updateTelegram="
                  (value) =>
                    setCurrentSetting(value, 'notification_settings_app')
                "
                @updateEmail="
                  (value) =>
                    setCurrentSetting(value, 'notification_author_settings_app')
                "
              >
                <template #subtitle>Настройка уведомлений в системе</template>
              </SettingList>
              <AidocNotificationsSettings
                v-else
                :aidoc-author-settings="
                  aidocSettings.notification_author_settings_app
                "
                :aidoc-member-settings="aidocSettings.notification_settings_app"
                @updateDocAuthorSettings="
                  (value) =>
                    setCurrentSetting(
                      value,
                      'notification_author_settings_app',
                      'doc',
                    )
                "
                @updateDocMemberSettings="
                  (value) =>
                    setCurrentSetting(value, 'notification_settings_app', 'doc')
                "
              >
                <template #subtitle>Настройка уведомлений в системе</template>
              </AidocNotificationsSettings>
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
// core
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

import SettingList from './NotificationsSettings/SettingList.vue';
import AidocNotificationsSettings from '../aidoc/AidocNotificationsSettings.vue';

// composables
import { useLoad } from 'src/composables/useLoad';
import DefaultLoader from '../loaders/DefaultLoader.vue';

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const props = defineProps(['project', 'isAidocPage']);

const dialogRef = ref();
const tab = ref('email');

const settings = ref({
  notification_author_settings_email: {},
  notification_author_settings_tg: {},
  notification_settings_email: {},
  notification_settings_tg: {},
  notification_settings_app: {},
  notification_author_settings_app: {},
});

const aidocSettings = ref({
  notification_author_settings_email: {},
  notification_author_settings_tg: {},
  notification_author_settings_app: {},
  notification_settings_email: {},
  notification_settings_tg: {},
  notification_settings_app: {},
});

const setCurrentSetting = (
  value,
  nameField: string,
  target = 'project',
): void => {
  if (target === 'project') settings.value[nameField] = { ...value };
  if (target === 'doc')
    aidocSettings.value[nameField] = {
      ...aidocSettings.value[nameField],
      ...value,
    };
};

const getProjectUser = async () => {
  if (!props.project?.id) return;
  await projectStore
    .getMeInProject(currentWorkspaceSlug.value, props.project?.id)
    .then((data) => {
      settings.value.notification_author_settings_email = {
        ...data.notification_author_settings_email,
      };
      settings.value.notification_author_settings_tg = {
        ...data.notification_author_settings_tg,
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
      settings.value.notification_author_settings_app = {
        ...data.notification_author_settings_app,
      };
    });
};

const getAidocNotificationsSettings = async (): Promise<void> => {
  await workspaceStore
    .getWorkspaceNotifications(currentWorkspaceSlug.value)
    .then((data) => {
      aidocSettings.value.notification_author_settings_email = {
        ...data.notification_author_settings_email,
      };
      aidocSettings.value.notification_author_settings_tg = {
        ...data.notification_author_settings_tg,
      };
      aidocSettings.value.notification_author_settings_app = {
        ...data.notification_author_settings_app,
      };
      aidocSettings.value.notification_settings_email = {
        ...data.notification_settings_email,
      };
      aidocSettings.value.notification_settings_tg = {
        ...data.notification_settings_tg,
      };
      aidocSettings.value.notification_settings_app = {
        ...data.notification_settings_app,
      };
    });
};

const handleSaveSettings = async () => {
  if (props.project) {
    await projectStore
      .setProjectNotificationSettings(
        currentWorkspaceSlug.value,
        props.project.id,
        settings.value,
      )
      .then(() => {
        setNotificationView({
          open: true,
          type: 'success',
        });
        dialogRef.value.hide();
      });
  } else {
    await workspaceStore
      .setAiDocNotificationSettings(
        currentWorkspaceSlug.value,
        aidocSettings.value,
      )
      .then(() => {
        setNotificationView({
          open: true,
          type: 'success',
        });
        dialogRef.value.hide();
      });
  }
};

const { loading, onLoad } = useLoad(getProjectUser);

watch(
  () => props.project,
  async () => await getProjectUser(),
);

onMounted(async () => {
  if (props.isAidocPage) await getAidocNotificationsSettings();
});
</script>

<style scoped lang="scss">
.notification-setting {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
}

:deep(.q-card__section--vert) {
  padding: 0 16px !important;
  @media screen and (max-width: 720px) {
    padding: 0 8px !important;
  }
}
:deep(.q-card__actions) {
  padding: 8px 16px 16px 16px !important;
}
</style>
