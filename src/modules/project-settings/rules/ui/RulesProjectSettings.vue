<template>
  <div class="row mobile-block q-mt-md gap-x-sm">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Скрипты</h4>
      <div class="text-sm text-brand-secondary">
        <p class="q-mb-none">
          Управление скриптами проекта. Доступные события:
        </p>
        <ul>
          <li>
            <b>BeforeStatusChange(params, newstatus)</b> - вызывается перед
            сменой статуса.
          </li>
          <li>
            <b>AfterStatusChange(params, newstatus)</b> - вызывается после смены
            статуса.
          </li>
          <li>
            <b>BeforeAssigneesChange(params)</b> - вызывается перед сменой
            исполнителя.
          </li>
          <li>
            <b>BeforeWatchersChange(params)</b> - вызывается перед сменой
            наблюдателя.
          </li>
          <li>
            <b>BeforeLabelsChange(params)</b> - вызывается перед сменой тега.
          </li>
        </ul>
        <p>
          Приведённые в событиях названия параметров условны, при объявлении
          функции можно задать любые названия параметров.
        </p>
        <p class="q-mb-none">Методы:</p>
        <ul>
          <li><b>checkName</b> - проверяет название тега</li>
          <li><b>checkEmail</b> - проверяет почту исполнителя/наблюдателя</li>
          <li>
            <b>compareStatusName</b> - проверяет название текущего статуса
            задачи
          </li>
          <li>
            <b>compareUserEmail</b> - проверяет почту пользователя, который
            вносит изменения
          </li>
        </ul>
        <p class="q-mb-none">
          Функции должны возвращать таблицу со следующими объектами:
        </p>
        <ul>
          <li><b>status</b> - boolean, если true - статус меняется</li>
          <li><b>error</b> - string, текст ошибки</li>
        </ul>
      </div>
    </div>
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Скрипты</h4>
      <EditorCodeProjectSettings
        editor-id="editor-code-settings"
        v-model:content="rulesField"
        @get-editor="getEditor"
      />
    </div>
  </div>

  <q-card-actions style="background-color: transparent" align="right">
    <q-btn no-caps class="secondary-btn" @click="handleSaveRule">
      Сохранить
    </q-btn>
  </q-card-actions>

  <div class="row justify-end mobile-block">
    <div class="col col-md-6">
      <div class="row justify-between items-center">
        <h4 class="text-lg font-semibold text-brand-base">Логи</h4>
        <q-select
          dense
          v-model="logs.select"
          class="adaptive-select selector-option base-selector-sm col-5"
          :options="logsFilterOptions"
          @update:model-value="loadLogs"
          :option-label="(col) => col?.toUpperCase()"
          :option-value="(col) => col"
          multiple
        >
          <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
            <q-item
              v-bind="itemProps"
              class="selector-option__wrapper selector-option-columns__wrapper q-py-none"
            >
              <q-item-section side>
                <q-checkbox
                  :model-value="selected"
                  @update:model-value="toggleOption(opt)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ opt?.toUpperCase() }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <LogsProjectSettings :content="logs.content" />
    </div>
  </div>
  <q-card-actions style="background-color: transparent" align="right">
    <q-btn no-caps class="secondary-btn" @click="loadLogs"> Обновить </q-btn>
  </q-card-actions>
</template>

<script setup lang="ts">
// core
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { onMounted, reactive, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useNotificationStore } from 'src/stores/notification-store';

// constants
import { SUCCESS_SCRIPT_SAVE } from 'src/constants/notifications';

// interfaces
import type { LogType } from 'src/interfaces/logs';
import { DtoRulesLog } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//components
import EditorCodeProjectSettings from 'src/modules/project-settings/rules/ui/EditorCodeProjectSettings.vue';
import LogsProjectSettings from 'src/modules/project-settings/rules/ui/LogsProjectSettings.vue';

// services
import { updateProject } from '../../services/api';
import { loadLogsList, loadRulesScript } from '../services/api';


// core
const route = useRoute();

// stores
const projectStore = useProjectStore();
const { setNotificationView } = useNotificationStore();

// store to refs
const { project } = storeToRefs(projectStore);

// vars
const logsFilterOptions: LogType[] = ['error', 'print', 'success', 'fail'];
const rulesField = ref('');
const editorCode = ref<Editor>();
const metadata = ref({
  title: 'Загрузка...',
});

const logs = reactive<{
  content: DtoRulesLog[];
  select: LogType[];
}>({
  content: [],
  select: ['error', 'print', 'success', 'fail'],
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

async function refresh() {
  await loadLogs();
  setAnotherTitle(project.value.name);
  await loadScript();
}

onMounted(async () => refresh());

async function onSuccess() {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_SCRIPT_SAVE,
  });
  await projectStore.getProjectInfo(
    route.params.workspace as string,
    route.params.project as string,
  );
  refresh();
}

function handleSaveRule() {
  updateProject(
    route.params.workspace as string,
    route.params.project as string,
    {
      rules_script: editorCode.value?.getText(),
    },
  ).then(() => onSuccess());
}

function getEditor(value: Editor) {
  editorCode.value = value;
}

async function loadLogs() {
  await loadLogsList(project.value.workspace_detail?.slug, project.value.id, {
    select: logs.select,
  }).then((response) => {
    logs.content = response.result?.reverse();
  });
}

async function loadScript() {
  await loadRulesScript(project.value.workspace_detail?.slug, project.value.id).then((response) => {
    rulesField.value = response?.rules_script ?? '';
  });
}
</script>
