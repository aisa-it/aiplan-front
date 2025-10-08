<template>
  <q-dialog ref="dialogRef" @before-show="onLoad()">
    <q-card v-if="!loading" class="modal-card">
      <q-card-section>
        <slot name="header" />
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
          <q-tab
            v-for="tab in tabsConfig"
            :name="tab.name"
            :label="tab.label"
            :key="tab.field"
          />
        </q-tabs>
        <transition name="fade-slide" mode="out-in">
          <q-tab-panels v-model="tab">
            <q-tab-panel
              style="padding: 8px 0px 0px 0px"
              v-for="tab in tabsConfig"
              :key="tab.field"
              :name="tab.name"
            >
              <AdminSettingsList
                :settings="settings[tab.field]"
                :settingsList="settingsList"
                @update="
                  (updatedField: { field: string; value: boolean }) =>
                    setCurrentSetting(updatedField, tab.field)
                "
              >
                <template #subtitle>{{ tab.title }}</template>
              </AdminSettingsList>
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

import { useNotificationStore } from 'src/stores/notification-store';

import DefaultLoader from '../../loaders/DefaultLoader.vue';
import AdminSettingsList from './AdminSettingsList.vue';

const loading = ref(false);
const onLoad = () => getUserSettings();

const props = defineProps<{
  settingsList: { title: string; field: string }[];
  getUserSettings: () => any;
  saveUserSettings: (settings: SettingsType) => any;
}>();

const tab = ref('email');

const tabsConfig = [
  {
    name: 'email',
    field: 'notification_settings_email',
    title: 'Настройка уведомлений по почте',
    label: 'Email',
  },
  {
    name: 'tg',
    field: 'notification_settings_tg',
    title: 'Настройка уведомлений в Telegram',
    label: 'Telegram',
  },
  {
    name: 'app',
    field: 'notification_settings_app',
    title: 'Настройка уведомлений в системе',
    label: 'Система',
  },
] as const;

//TODO когда в контракте появятся новые настройки, можно заменить any
interface SettingsType {
  notification_author_settings_email: any;
  notification_author_settings_tg: any;
  notification_author_settings_app: any;
  notification_settings_email: any;
  notification_settings_tg: any;
  notification_settings_app: any;
}

const settings = ref<SettingsType>({
  notification_author_settings_email: {},
  notification_author_settings_tg: {},
  notification_author_settings_app: {},
  notification_settings_email: {},
  notification_settings_tg: {},
  notification_settings_app: {},
});

const getUserSettings = async () => {
  await props.getUserSettings().then((data) => {
    if (!data) return;

    (Object.keys(settings.value) as Array<keyof SettingsType>).forEach(
      (key) => {
        if (data.hasOwnProperty(key)) {
          settings.value[key] = { ...data[key] };
        }
      },
    );
  });
};

const dialogRef = ref();
const { setNotificationView } = useNotificationStore();
const handleSaveSettings = async () => {
  await props.saveUserSettings(settings.value).then(() => {
    setNotificationView({
      open: true,
      type: 'success',
    });
    dialogRef.value.hide();
  });
};

const MemberSettingToAuthor = (setting: keyof SettingsType) => {
  switch (setting) {
    case 'notification_settings_email':
      return 'notification_author_settings_email';
    case 'notification_settings_tg':
      return 'notification_author_settings_tg';
    case 'notification_settings_email':
      return 'notification_author_settings_email';
    default:
      return setting;
  }
};

const setCurrentSetting = (
  updatedField: { field: string; value: boolean },
  setting: keyof SettingsType,
) => {
  settings.value[setting][updatedField.field] = updatedField.value;
  settings.value[MemberSettingToAuthor(setting)][updatedField.field] =
    updatedField.value;
};
</script>

<style scoped lang="scss">
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
