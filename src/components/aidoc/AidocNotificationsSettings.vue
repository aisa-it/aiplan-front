<template>
  <q-card class="setting-card">
    <div class="setting-card__subtitle sub-text">
      <slot name="subtitle"></slot>
    </div>

    <div class="setting-card__header">
      <p class="setting-card__labels-title">Название</p>
      <p class="setting-card__checkboxes-title">Автор</p>
      <p class="setting-card__checkboxes-title">Участник</p>
    </div>

    <div class="setting-card__list">
      <div class="setting-card__setting">
        <span class="centered-horisontally">Все</span>
        <q-checkbox
          v-model="isAllAuthorSettingsChecked"
          class="justify-center"
          @update:model-value="
            () => {
              setAllSettings(aidocAuthorSettings, isAllAuthorSettingsChecked);
              emits('updateDocAuthorSettings', invertSettingsValue(aidocAuthorSettings));
            }
          "
        />
        <q-checkbox
          v-model="isAllMemberSettingsChecked"
          class="justify-center"
          @update:model-value="
            () => {
              setAllSettings(aidocMemberSettings, isAllMemberSettingsChecked);
              emits('updateDocMemberSettings', invertSettingsValue(aidocMemberSettings));
            }
          "
        />
      </div>

      <div
        v-for="item in settingsItems"
        :key="item.key"
        class="setting-card__setting"
      >
        <span class="centered-horisontally">{{ item.label }}</span>
        <q-checkbox
          v-model="aidocAuthorSettings[item.key]"
          class="justify-center"
          @update:model-value="handleCheck"
        />
        <q-checkbox
          v-model="aidocMemberSettings[item.key]"
          class="justify-center"
          @update:model-value="handleCheck"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { INITIAL_AIDOC_NOTIFICATION_SETTINGS } from 'src/constants/aidocNotificationSettings';
import { IDocNotificationsSettings } from 'src/interfaces/aidocNotificationSettings';

const props = defineProps<{
  aidocAuthorSettings: IDocNotificationsSettings;
  aidocMemberSettings: IDocNotificationsSettings;
}>();

const emits = defineEmits<{
  updateDocAuthorSettings: [value: IDocNotificationsSettings];
  updateDocMemberSettings: [value: IDocNotificationsSettings];
}>();

const isAllAuthorSettingsChecked = ref<boolean>(false);
const isAllMemberSettingsChecked = ref<boolean>(false);

const aidocAuthorSettings = ref<IDocNotificationsSettings>(
  initializeSettings(props.aidocAuthorSettings),
);
const aidocMemberSettings = ref<IDocNotificationsSettings>(
  initializeSettings(props.aidocMemberSettings),
);

const settingsMap = {
  disable_doc_create: 'Создание документа',
  disable_doc_delete: 'Удаление документа',
  disable_doc_move: 'Перенос документа',
  disable_doc_title: 'Изменение названия',
  disable_doc_desc: 'Изменение описания',
  disable_doc_attachment: 'Изменение вложений',
  disable_doc_comment: 'Обновление комментариев',
  disable_doc_watchers: 'Изменение наблюдателей',
  disable_doc_role: 'Изменение роли участника',
};

const settingsItems = computed<
  {
    key: keyof IDocNotificationsSettings;
    label: string;
  }[]
>(() => {
  return Object.keys(settingsMap).map((key) => ({
    key: key as keyof IDocNotificationsSettings,
    label: settingsMap[key as keyof typeof settingsMap],
  }));
});

// Инвертируем значения для корректного UI. Поле вида disable_setting: false предполагает включенный чекбокс, true - выключенный.
function invertSettingsValue(
  settings: IDocNotificationsSettings,
): IDocNotificationsSettings {
  const invertedSettings = { ...settings };
  for (const setting in settings) {
    invertedSettings[setting as keyof typeof invertedSettings] =
      !settings[setting as keyof typeof settings];
  }
  return invertedSettings;
}

function initializeSettings(
  settings: IDocNotificationsSettings,
): IDocNotificationsSettings {
  // Поля по умолчанию
  const result = { ...INITIAL_AIDOC_NOTIFICATION_SETTINGS };
  // Перезапись полей по умолчанию, если в пропсах есть настройки
  if (settings && typeof settings === 'object') {
    for (const key in settings) {
      if (key in result) {
        result[key as keyof IDocNotificationsSettings] =
          settings[key as keyof IDocNotificationsSettings] ??
          result[key as keyof IDocNotificationsSettings];
      }
    }
  }
  return invertSettingsValue(result);
}

const setAllSettings = (
  settings: IDocNotificationsSettings,
  value: boolean,
): void => {
  for (const key in settings) {
    settings[key as keyof IDocNotificationsSettings] = value;
  }
};

const IsAllSettingsChecked = (
  settings: IDocNotificationsSettings,
): boolean => {
  for (const setting in settings) {
    if (settings[setting as keyof IDocNotificationsSettings] === true) {
      continue;
    } else {
      return false;
    }
  }
  return true;
};

const handleCheck = (): void => {
  isAllAuthorSettingsChecked.value = IsAllSettingsChecked(aidocAuthorSettings.value);
  isAllMemberSettingsChecked.value = IsAllSettingsChecked(aidocMemberSettings.value);
  emits('updateDocAuthorSettings', invertSettingsValue(aidocAuthorSettings.value));
  emits('updateDocMemberSettings', invertSettingsValue(aidocMemberSettings.value));
};

onMounted(() => handleCheck());
</script>

<style scoped lang="scss">
.setting-card {
  box-shadow: none;

  &__header {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    padding: 8px;
  }

  &__subtitle {
    padding: 8px 0;
  }

  &__labels-title {
    margin: 0;
    font-weight: 600;
  }

  &__checkboxes-title {
    margin: 0;
    text-align: center;
  }

  &__list {
    margin-bottom: 8px;
    max-height: calc(100vh - 400px);
    overflow-y: scroll;
    padding: 0px 8px;
    @media screen and (max-width: 480px) {
      max-height: 30vh;
    }
  }

  &__setting {
    display: grid;
    grid-template-columns: 3fr 1fr 1fr;
    margin-bottom: 8px;
  }
}
</style>
