<template>
  <q-card class="setting-card">
    <div class="sub-text q-ml-sm q-my-sm"><slot name="subtitle"></slot></div>
    <div class="notification-header">
      <div style="font-size: 14px; font-weight: 600">Название</div>
      <span style="text-align: center">Автор</span>
      <span
        style="text-align: center"
        :style="Screen.width < 381 ? 'margin-right: -8px;' : ''"
        >Участник</span
      >
    </div>
    <div class="notification-list">
      <div class="notification-setting">
        <span class="centered-horisontally">Все</span>
        <q-checkbox
          class="justify-center"
          v-model="emailAllSettings"
          @update:model-value="
            () => {
              setAllSettings(authorSetting, emailAllSettings);
              emits('updateEmail', invertedSettings(authorSetting));
            }
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="telegramAllSettings"
          @update:model-value="
            () => {
              setAllSettings(memberSettings, telegramAllSettings);
              emits('updateTelegram', invertedSettings(memberSettings));
            }
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилось название</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_name"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_name"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилось описание</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_desc"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_desc"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменился статус</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_state"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_state"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>

      <div class="notification-setting">
        <span>Изменился исполнитель</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_assignees"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_assignees"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменился наблюдатель</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_watchers"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_watchers"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменился приоритет</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_priority"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_priority"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилась родительская задача</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_parent"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_parent"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилась заблокированная задача</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_blocks"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_blocks"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилась блокирующая задача</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_blockedBy"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_blockedBy"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменилась дата выполнения</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_targetDate"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_targetDate"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменились теги</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_labels"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_labels"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменились ссылки</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_links"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_links"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Обновление комментариев</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_comments"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_comments"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменение вложений</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_attachments"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_attachments"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Перенос задачи</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_issue_transfer"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_issue_transfer"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменились подзадачи</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_sub_issue"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_sub_issue"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Изменились связи задач</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_linked"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_linked"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
      <div class="notification-setting">
        <span>Уведомление об истечении срока выполнения</span>
        <q-checkbox
          class="justify-center"
          v-model="authorSetting.disable_deadline"
          @update:model-value="
            emits('updateEmail', invertedSettings(authorSetting))
          "
        ></q-checkbox>
        <q-checkbox
          class="justify-center"
          v-model="memberSettings.disable_deadline"
          @update:model-value="
            emits('updateTelegram', invertedSettings(memberSettings))
          "
        ></q-checkbox>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
// core
import { Screen } from 'quasar';
import { ref, watchEffect, onMounted } from 'vue';

// interfaces
import { IProjectNotificationSettings } from 'src/interfaces/projectNotificationSettings';

// constants
import { INITIAL_PROJECT_NOTIFICATION_SETTINGS } from 'src/constants/projectNotificationSettings';

const emits = defineEmits<{
  updateTelegram: [value: IProjectNotificationSettings];
  updateEmail: [value: IProjectNotificationSettings];
}>();

const props = defineProps(['project', 'authorSettings', 'memberSettings']);

const emailAllSettings = ref(false);
const telegramAllSettings = ref(false);

const authorSetting = ref<IProjectNotificationSettings>(
  props.authorSettings || INITIAL_PROJECT_NOTIFICATION_SETTINGS,
);
const memberSettings = ref<IProjectNotificationSettings>(
  props.memberSettings || INITIAL_PROJECT_NOTIFICATION_SETTINGS,
);
onMounted(() => {
  authorSetting.value = invertedSettings(props.authorSettings);
  memberSettings.value = invertedSettings(props.memberSettings);
  defineAll();
});
const invertedSettings = (settings: any) => {
  let invertedSettings = JSON.parse(
    JSON.stringify(INITIAL_PROJECT_NOTIFICATION_SETTINGS),
  );
  for (let setting in settings) {
    invertedSettings[setting as keyof typeof invertedSettings] =
      !settings[setting as keyof typeof settings];
  }
  return invertedSettings;
};

const isAll = (settings: any) => {
  let isAll = true;
  // удаляем поле, т.к. в проверке оно нам не нужно
  delete settings?.notify_before_deadline;
  for (let s in settings) {
    if (isAll === false) return (isAll = false);

    if (settings[s] === true) {
      isAll = true;
    } else isAll = false;
  }
  return isAll;
};

const setAllSettings = (settings: any, isAll: boolean) => {
  for (let setting in settings) {
    settings[setting] = isAll;
  }
};

const defineAll = () => {
  emailAllSettings.value = isAll(authorSetting.value);
  telegramAllSettings.value = isAll(memberSettings.value);
};

watchEffect(() => {
  defineAll();
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
