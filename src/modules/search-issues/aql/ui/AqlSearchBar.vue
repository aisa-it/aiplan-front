<template>
  <div class="aql-search-bar">
    <div class="row no-wrap items-start">
      <AqlEditor
        ref="editorRef"
        class="aql-search-bar__editor"
        :model-value="modelValue"
        :error="error"
        @update:model-value="(value) => emits('update:modelValue', value)"
        @submit="submit"
      />
      <q-btn
        no-caps
        class="primary-btn q-ml-sm"
        :disable="isEmpty"
        :loading="loading"
        @click="submit"
      >
        Поиск
      </q-btn>
      <q-btn
        class="btn-only-icon q-ml-sm aql-search-bar__refresh"
        aria-label="Обновить результаты поиска"
        :disable="!refreshable || loading"
        @click="emits('refresh')"
      >
        <RefreshIcon />
        <HintTooltip>Обновить результаты поиска</HintTooltip>
      </q-btn>
      <q-btn class="btn-only-icon q-ml-sm" aria-label="Справка по поиску">
        <HelpIcon />
        <AqlHelpPopup />
      </q-btn>
    </div>

    <div class="row items-center q-mt-sm aql-search-bar__actions">
      <div v-if="total != null" class="aql-search-bar__total">
        Найдено задач: <b>{{ total }}</b>
        <span v-if="time != null" class="aql-search-bar__time">
          за {{ formatTime(time) }}
        </span>
      </div>
      <div class="row no-wrap aql-search-bar__aux-group">
        <q-btn
          flat
          no-caps
          class="btn-sm aql-search-bar__aux"
          :disable="isEmpty"
          @click="copyLink"
        >
          <LinkIcon :width="18" :height="18" />
          <span>Скопировать ссылку</span>
        </q-btn>
        <q-btn
          flat
          no-caps
          class="btn-sm aql-search-bar__aux"
          :disable="isEmpty"
        >
          <FileZIPIcon :width="18" :height="18" />
          <span>Экспорт</span>
          <q-popup-proxy ref="exportPopupRef">
            <q-card style="min-width: 300px">
              <q-card-section class="q-pa-md">
                <q-checkbox
                  v-model="includeProperties"
                  label="Выгружать дополнительные параметры"
                />
              </q-card-section>
              <q-card-actions align="right" class="q-px-md q-pb-md">
                <q-btn
                  flat
                  no-caps
                  color="primary"
                  label="Скачать"
                  :loading="exporting"
                  @click="exportZip"
                />
              </q-card-actions>
            </q-card>
          </q-popup-proxy>
        </q-btn>
        <AqlColumnsButton
          class="aql-search-bar__aux"
          :columns="columns"
          :columns-to-show="columnsToShow"
          @update:columns-to-show="
            (value) => emits('update:columnsToShow', value)
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import AqlEditor from './AqlEditor.vue';
import AqlColumnsButton from './AqlColumnsButton.vue';
import AqlHelpPopup from './AqlHelpPopup.vue';
import FileZIPIcon from 'src/components/icons/FileZIPIcon.vue';
import HelpIcon from 'src/components/icons/HelpIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import RefreshIcon from 'src/components/icons/RefreshIcon.vue';

import { AqlQueryError } from '../services/api';
import { useCopyAqlLink } from '../utils/copyLink';

const props = defineProps<{
  modelValue: string;
  error?: AqlQueryError | null;
  loading?: boolean;
  // сколько задач нашёл выполненный запрос; null — показывать нечего
  total?: number | null;
  // время выполнения запроса на бэке, мс
  time?: number | null;
  // есть выполненный запрос, который можно повторить
  refreshable?: boolean;
  // выгрузка архива: true — успешно, окно выбора закрывается
  exportIssues: (includeProperties: boolean) => Promise<boolean>;
  columns: any[];
  columnsToShow: string[];
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string];
  'update:columnsToShow': [value: string[]];
  search: [];
  refresh: [];
}>();

const editorRef = ref<InstanceType<typeof AqlEditor> | null>(null);

const isEmpty = computed(() => !props.modelValue.trim());

const submit = () => {
  if (isEmpty.value || props.loading) return;
  emits('search');
};

const formatTime = (ms: number) =>
  ms < 1000
    ? `${Math.round(ms)} мс`
    : `${(ms / 1000).toFixed(1).replace('.', ',')} с`;

const exportPopupRef = ref();
const includeProperties = ref(false);
const exporting = ref(false);

const exportZip = async () => {
  if (exporting.value) return;
  exporting.value = true;
  try {
    if (await props.exportIssues(includeProperties.value))
      exportPopupRef.value?.hide();
  } finally {
    exporting.value = false;
  }
};

const copyAqlLink = useCopyAqlLink();
const copyLink = () => copyAqlLink(props.modelValue);

defineExpose({
  focus: () => editorRef.value?.focus(),
});
</script>

<style scoped lang="scss">
.aql-search-bar {
  flex: 1 1 0;
  min-width: 0;

  &__editor {
    flex: 1 1 0;
    min-width: 0;
  }

  &__actions {
    gap: 8px;
  }

  // в узком окне кнопки переносятся под счётчик вместе, а не по одной
  &__aux-group {
    gap: 8px;
    margin-left: auto;
  }

  &__total {
    font-size: 13px;

    b {
      font-weight: 700;
    }
  }

  &__time {
    color: $sub-text-color;

    // в узком окне время вытесняло кнопки на вторую строку
    @media (max-width: 880px) {
      display: none;
    }
  }

  // вспомогательные кнопки: спокойнее и ниже, чем «Поиск»
  &__aux {
    border: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 400;
  }
}
</style>
