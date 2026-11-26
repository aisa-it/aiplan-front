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
  // есть выполненный запрос, который можно повторить
  refreshable?: boolean;
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

  // вспомогательные кнопки: спокойнее и ниже, чем «Поиск»
  &__aux {
    border: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 400;
  }
}
</style>
