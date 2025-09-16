<template>
  <q-card class="setting-card">
    <div class="setting-card__subtitle sub-text">
      <slot name="subtitle"></slot>
    </div>

    <div class="setting-card__list">
      <div class="setting-card__setting">
        <span class="centered-horisontally">Все</span>
        <q-checkbox
          v-model="isAllSettingsChecked"
          class="justify-center"
          @update:model-value="
            () => {
              setAllSettings(aidocSettings, isAllSettingsChecked);
              emits('updateDocSettings', aidocSettings);
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
          v-model="aidocSettings[item.key]"
          class="justify-center"
          @update:model-value="handleCheck"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IDocNotificationsSettings } from 'src/interfaces/aidocNotificationSettings';

const props = defineProps<{
  aidocSettings: IDocNotificationsSettings;
}>();

const emits = defineEmits<{
  updateDocSettings: [value: IDocNotificationsSettings];
}>();

const INITIAL_AIDOC_NOTIFICATION_SETTINGS = {
  disable_doc_title: false,
  disable_doc_desc: false,
  disable_doc_role: false,
  disable_doc_attachment: false,
  disable_doc_comment: false,
  disable_doc_editor: false,
  disable_doc_watchers: false,
  disable_doc_reader: false,
  disable_doc_create: false,
  disable_doc_delete: false,
  disable_doc_move: false,
};

const isAllSettingsChecked = ref<boolean>(false);

const aidocSettings = ref<IDocNotificationsSettings>(
  initializeSettings(props.aidocSettings),
);

const settingsMap = {
  disable_doc_title: 'Изменение названия',
  disable_doc_desc: 'Изменение описания',
  disable_doc_role: 'Изменение роли',
  disable_doc_attachment: 'Прикрепление файлов',
  disable_doc_comment: 'Комментарии',
  disable_doc_editor: 'Редакторы',
  disable_doc_watchers: 'Наблюдатели',
  disable_doc_reader: 'Читатели',
  disable_doc_create: 'Создание документа',
  disable_doc_delete: 'Удаление документа',
  disable_doc_move: 'Перемещение документа',
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

function initializeSettings(
  settings: Partial<IDocNotificationsSettings>,
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
  return result;
}

const setAllSettings = (
  settings: IDocNotificationsSettings,
  value: boolean,
): void => {
  for (const key in settings) {
    settings[key as keyof IDocNotificationsSettings] = value;
  }
};

const getIsAllSettingsCheckedState = (
  settings: IDocNotificationsSettings,
): void => {
  for (const setting in settings) {
    if (settings[setting as keyof IDocNotificationsSettings] === true) {
      continue;
    } else {
      isAllSettingsChecked.value = false;
      return;
    }
  }
  isAllSettingsChecked.value = true;
};

const handleCheck = (): void => {
  getIsAllSettingsCheckedState(aidocSettings.value);
  emits('updateDocSettings', aidocSettings.value);
};

onMounted(() => handleCheck());
</script>

<style scoped lang="scss">
.setting-card {
  box-shadow: none;

  &__subtitle {
    padding: 8px 0;
  }

  &__setting {
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}
</style>
