<template>
  <q-dialog ref="dialogRef" @before-show="fillForm" @hide="onHide">
    <q-card class="aql-filter-dialog row">
      <q-layout view="hHh Lpr lff" container>
        <q-drawer
          v-if="!isEdit"
          v-model="leftDrawerOpen"
          show-if-above
          :width="200"
          :breakpoint="500"
          bordered
          class="no-wrap overflow-hidden"
          style="padding: 10px"
        >
          <AddFiltersList aql @set-filter="(value) => fillFrom(value)" />
        </q-drawer>
        <q-page-container class="aql-filter-dialog__scroll">
          <q-card-section class="aql-filter-dialog__content">
            <div
              class="row items-center justify-between centered-horisontally q-mb-sm"
            >
              <div class="no-wrap row centered-horisontally">
                <q-btn
                  v-if="!isEdit"
                  flat
                  dense
                  round
                  style="height: 30px; width: 30px"
                  aria-label="Menu"
                  class="q-mr-sm"
                  @click="leftDrawerOpen = !leftDrawerOpen"
                >
                  <MenuIcon />
                </q-btn>
                <h6 style="font-weight: 600; margin: 0 !important">
                  {{ isEdit ? 'Редактирование фильтра' : 'Новый фильтр' }}
                </h6>
              </div>
              <q-btn flat dense v-close-popup><CloseIcon /></q-btn>
            </div>
            <div class="row items-start justify-between">
              <q-input
                ref="nameRef"
                v-model="form.name"
                label="Название"
                dense
                :rules="[
                  (val) =>
                    (val && val.trim().length > 0) ||
                    'Необходимо ввести название',
                ]"
                class="base-input q-mb-sm aql-filter-dialog__name"
                :class="isEdit ? 'col-11' : 'col-12'"
              />
              <q-btn
                v-if="isEdit"
                class="secondary-btn-only-icon aql-filter-dialog__copy"
                :disable="!form.aql.trim()"
                @click="copyAqlLink(form.aql)"
              >
                <LinkIcon color="var(--primary)" />
                <HintTooltip>Скопировать ссылку</HintTooltip>
              </q-btn>
            </div>
            <q-input
              v-model="form.description"
              label="Описание"
              type="textarea"
              dense
              class="base-textarea q-mb-sm aql-filter-dialog__description"
            />
            <div class="aql-filter-dialog__label">Запрос</div>
            <AqlEditor
              :model-value="form.aql"
              :error="queryError"
              @update:model-value="onQueryInput"
              @submit="handleSave"
            />
            <div v-if="queryRequired" class="aql-filter-dialog__query-error">
              Необходимо ввести запрос
            </div>
            <div v-if="hasOldFilter" class="aql-filter-dialog__hint">
              Фильтр создан в обычном поиске. После изменения запроса он
              останется только в режиме AQL.
            </div>
            <div class="aql-filter-dialog__actions">
              <q-checkbox
                v-model="form.public"
                label="Публичный"
                class="aql-filter-dialog__public"
              />
              <q-btn
                no-caps
                class="primary-btn aql-filter-dialog__save"
                style="width: 110px"
                :loading="saving"
                @click="handleSave"
              >
                Сохранить
              </q-btn>
            </div>
          </q-card-section>
        </q-page-container>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { computed, ref, watch } from 'vue';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import AqlEditor from './AqlEditor.vue';
import AddFiltersList from 'src/modules/search-issues/filter-list/ui/add-filter/AddFiltersList.vue';
import HintTooltip from 'src/components/HintTooltip.vue';
import MenuIcon from 'src/components/icons/MenuIcon.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';

// services
import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';
import { AqlFilter, AqlQueryError, saveAqlFilter } from '../services/api';

// utils
import { useCopyAqlLink } from '../utils/copyLink';
import { hasOldConditions } from 'src/modules/search-issues/filter-list/utils/conditions';

const props = defineProps<{
  // задан с id — правка, иначе создание
  currentFilter?: AqlFilter | null;
  // текст из поля поиска: с него начинается запрос нового фильтра
  initialQuery?: string;
}>();

const emits = defineEmits<{
  hide: [];
  saved: [];
}>();

const filtersStore = useFiltersStore();
const { setNotificationView } = useNotificationStore();
const copyAqlLink = useCopyAqlLink();

const emptyForm = () => ({ name: '', description: '', public: false, aql: '' });

const dialogRef = ref();
const nameRef = ref();
const leftDrawerOpen = ref(false);
const saving = ref(false);
const form = ref(emptyForm());
// ошибка разбора от бэка, с местом в запросе
const queryError = ref<AqlQueryError | null>(null);
const queryRequired = ref(false);

const isEdit = computed(() => !!props.currentFilter?.id);

const hasOldFilter = computed(
  () => isEdit.value && hasOldConditions(props.currentFilter?.filter),
);

const fillFrom = (filter: AqlFilter) => {
  form.value = {
    name: filter.name ?? '',
    description: filter.description ?? '',
    public: !!filter.public,
    aql: filter.aql ?? '',
  };
  queryError.value = null;
  queryRequired.value = false;
};

const fillForm = () => {
  if (props.currentFilter) fillFrom(props.currentFilter);
  else form.value = { ...emptyForm(), aql: props.initialQuery ?? '' };
};

const onQueryInput = (value: string) => {
  form.value.aql = value;
  // позиции ошибки устарели
  queryError.value = null;
  queryRequired.value = false;
};

const handleSave = async () => {
  if (saving.value) return;

  nameRef.value.validate();
  // позиции ошибки бэк считает по тому же тексту, что в поле
  form.value.aql = form.value.aql.trim();
  queryRequired.value = !form.value.aql;
  if (nameRef.value.hasError || queryRequired.value) return;

  saving.value = true;
  try {
    // запрос старого фильтра не меняли — возвращаем его условия, иначе бэк
    // их сотрёт и фильтр уйдёт из обычного поиска
    const keepsConditions =
      hasOldFilter.value &&
      form.value.aql === (props.currentFilter?.aql ?? '').trim();

    const result = await saveAqlFilter(props.currentFilter?.id ?? null, {
      name: form.value.name.trim(),
      description: form.value.description,
      public: form.value.public,
      aql: form.value.aql,
      ...(keepsConditions ? { filter: props.currentFilter?.filter } : {}),
    });

    if (!result.ok) {
      if (result.queryError) queryError.value = result.queryError;
      else
        setNotificationView({
          open: true,
          type: 'error',
          customMessage: result.message || 'Не удалось сохранить фильтр',
        });
      return;
    }

    filtersStore.myFilterList = await getMyFilters();
    filtersStore.filterList = await getFilters();
    emits('saved');
    dialogRef.value.hide();
  } finally {
    saving.value = false;
  }
};

const onHide = () => {
  form.value = emptyForm();
  queryError.value = null;
  queryRequired.value = false;
  emits('hide');
};

// фильтр для правки может прийти уже после открытия окна
watch(
  () => props.currentFilter,
  (filter) => {
    if (filter) fillFrom(filter);
  },
);
</script>

<style scoped lang="scss">
.aql-filter-dialog {
  // полей мало: окно ниже и уже штатного
  --aql-filter-dialog-height: min(72vh, 460px);

  min-width: 720px !important;
  height: var(--aql-filter-dialog-height);
  border-radius: 16px !important;
  @media (max-width: 760px) {
    min-width: 95% !important;
  }

  &__scroll {
    overflow-y: auto;
    height: calc(var(--aql-filter-dialog-height) - 32px);
    margin: 16px 8px;
  }

  &__content {
    padding: 0 12px;
  }

  &__label {
    font-size: 12px;
    line-height: 16px;
    color: $sub-text-color;
  }

  &__query-error {
    margin-top: 4px;
    font-size: 12px;
    line-height: 16px;
    color: $negative;
  }

  &__hint {
    margin-top: 8px;
    font-size: 12px;
    line-height: 16px;
    color: $sub-text-color;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  // список библиотеки задаёт себе 70vh, окно ниже — режем по его высоте
  :deep(.q-drawer .q-list) {
    max-height: calc(var(--aql-filter-dialog-height) - 84px);
  }
}

:deep(.q-textarea) {
  .q-field__control {
    padding: 0 6px 3px 12px;
  }
}
:deep(.absolute-full) {
  right: 0 !important;
}
</style>
