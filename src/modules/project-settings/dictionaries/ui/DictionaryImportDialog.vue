<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <q-card style="min-width: 600px; max-width: 95vw; border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Импорт строк</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-checkbox
          v-model="replace"
          label="Заменить существующие (строки без ссылок будут удалены, со ссылками — архивированы)"
          dense
        />

        <q-input
          v-model="jsonText"
          class="base-textarea"
          autogrow
          type="textarea"
          label="Строки (JSON-массив)"
          dense
          :error="error !== ''"
          :error-message="error"
          hint='Формат: [{"value": "Значение", "attrs": {"ключ": "значение"}}]'
          style="font-family: monospace"
        />

        <div class="row items-center q-mt-sm">
          <q-btn
            flat
            dense
            no-caps
            class="secondary-btn"
            icon="upload_file"
            label="Загрузить файл .json"
            @click="triggerFileInput"
          />
          <input
            ref="fileInputRef"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="handleFileSelect"
          />
          <span v-if="fileName" class="text-caption text-grey q-ml-sm">
            {{ fileName }}
          </span>
        </div>

        <q-banner
          v-if="result"
          dense
          class="q-mt-md bg-positive text-white rounded-borders"
        >
          Импорт завершен: создано — {{ result.created || 0 }}, удалено —
          {{ result.deleted || 0 }}, в архиве — {{ result.archived || 0 }}
        </q-banner>

        <div class="row justify-end q-mt-lg q-gutter-sm">
          <q-btn
            flat
            dense
            no-caps
            class="secondary-btn"
            style="width: 110px"
            label="Закрыть"
            v-close-popup
          />
          <q-btn
            flat
            dense
            no-caps
            class="primary-btn"
            style="width: 130px"
            label="Импортировать"
            :loading="isImporting"
            :disable="!jsonText.trim()"
            @click="onImport"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

//services
import {
  importDictionaryRows,
  ImportDictionaryRowsResult,
} from '../services/api';

const props = defineProps<{
  modelValue: boolean;
  dictionaryId?: string;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'imported'): void;
}>();

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const replace = ref(false);
const jsonText = ref('');
const error = ref('');
const fileName = ref('');
const isImporting = ref(false);
const result = ref<ImportDictionaryRowsResult | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);

//лимит импорта строк (BAK-365)
const IMPORT_ROWS_LIMIT = 10000;

//methods
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  fileName.value = file.name;
  error.value = '';
  result.value = null;

  const reader = new FileReader();
  reader.onload = () => {
    jsonText.value = String(reader.result || '');
    // валидируем сразу после загрузки файла
    validateJson();
  };
  reader.readAsText(file);
  input.value = '';
};

const validateJson = (): boolean => {
  error.value = '';
  const text = jsonText.value.trim();
  if (text === '') return false;

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    error.value = 'Некорректный JSON';
    return false;
  }

  if (!Array.isArray(parsed)) {
    error.value = 'Ожидается JSON-массив, например [{"value": "Значение"}]';
    return false;
  }

  if (parsed.length > IMPORT_ROWS_LIMIT) {
    error.value = `Слишком много строк: максимум ${IMPORT_ROWS_LIMIT}`;
    return false;
  }

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (!item || typeof item.value !== 'string' || item.value.trim() === '') {
      error.value = `У строки №${i + 1} нет значения (поле "value" обязательно)`;
      return false;
    }
  }

  return true;
};

const onImport = async () => {
  if (!props.dictionaryId) return;
  if (!validateJson()) return;

  isImporting.value = true;
  try {
    const rows = JSON.parse(jsonText.value).map((item: any) => ({
      value: item.value,
      ...(item.attrs !== undefined ? { attrs: item.attrs } : {}),
    }));

    const res = await importDictionaryRows(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      props.dictionaryId,
      { replace: replace.value, rows },
    );
    result.value = res;
    emits('imported');
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка импорта',
    });
  } finally {
    isImporting.value = false;
  }
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      replace.value = false;
      jsonText.value = '';
      error.value = '';
      fileName.value = '';
      result.value = null;
    }
  },
);
</script>
