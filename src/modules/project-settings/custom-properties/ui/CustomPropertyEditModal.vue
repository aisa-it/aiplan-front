<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <q-card style="width: min(400px, 95vw); border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? 'Редактировать параметр' : 'Создать параметр' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            class="base-input"
            label="Имя параметра"
            dense
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            class="base-selector"
            label="Тип"
            dense
            emit-value
            map-options
          />

          <div v-if="isSelectType" class="q-mt-md">
            <span class="text-grey-7">Варианты выбора:</span>
            <div class="q-mt-sm">
              <div
                v-for="(_, index) in form.options"
                :key="index"
                class="row items-center q-mb-sm"
              >
                <q-input
                  v-model="form.options![index]"
                  class="base-input col"
                  :label="`Вариант ${index + 1}`"
                  dense
                  :rules="[
                    (val) => !!val?.trim() || 'Поле не может быть пустым',
                  ]"
                  lazy-rules
                />
                <q-btn
                  icon="close"
                  flat
                  round
                  dense
                  size="sm"
                  class="q-ml-sm"
                  @click="removeOption(index)"
                  :disable="form.options?.length <= 0"
                />
              </div>
              <q-btn
                flat
                dense
                no-caps
                icon="add"
                label="Добавить вариант"
                color="primary"
                @click="addOption"
              />
            </div>
          </div>

          <div v-if="isLookupType" class="q-mt-md">
            <q-select
              v-model="form.dictionary_id"
              :options="dictionaryOptions"
              class="base-selector"
              label="Справочник проекта"
              dense
              emit-value
              map-options
              :loading="isDictionariesLoading"
              :rules="[(val) => !!val || 'Выберите справочник']"
              lazy-rules
            />
          </div>

          <div v-if="isDependencySupportedType" class="q-mt-md">
            <span class="text-grey-7">Зависимость:</span>

            <q-select
              v-model="form.dependency!.parent_template_id"
              :options="parentTemplateOptions"
              :display-value="parentTemplateDisplay || undefined"
              class="base-selector q-mt-sm"
              label="Родительский параметр"
              dense
              clearable
              emit-value
              map-options
              @update:model-value="onParentTemplateChange"
            />

            <q-select
              v-if="dependencyModes.length > 1"
              v-model="form.dependency!.mode"
              :options="dependencyModes"
              class="base-selector q-mt-sm"
              label="Режим"
              dense
              emit-value
              map-options
            />
            <div
              v-else-if="dependencyModes.length === 1"
              class="text-caption text-grey-7 q-mt-sm"
            >
              Режим: {{ dependencyModes[0].label }}
            </div>

            <!-- options_map: вариант родителя → допустимые варианты ребёнка -->
            <div v-if="isOptionsMapMode" class="q-mt-sm">
              <div
                v-for="parentOption in parentOptions"
                :key="parentOption"
                class="row items-center q-mb-sm"
              >
                <div class="col-12 col-sm-4 q-pr-sm word-wrap text-grey-7">
                  {{ parentOption }}
                </div>
                <q-select
                  v-model="form.dependency!.options_map![parentOption]"
                  :options="form.options"
                  class="base-selector col-12 col-sm-8 q-mt-xs q-mt-sm-none"
                  label="Допустимые варианты"
                  dense
                  multiple
                  clearable
                  emit-value
                  map-options
                />
              </div>
            </div>

            <q-input
              v-else-if="isRowFilterMode"
              v-model="form.dependency!.row_filter_attr"
              class="base-input q-mt-sm"
              label="Имя атрибута строки справочника (в attrs)"
              dense
            />
          </div>

          <div>
            <span class="text-grey-7">Видимость:</span>
            <div class="row q-mt-sm">
              <q-radio
                v-model="form.only_admin"
                :val="false"
                label="Все пользователи"
                dense
                class="q-mr-md"
              />
              <q-radio
                v-model="form.only_admin"
                :val="true"
                label="Только администраторы"
                dense
              />
            </div>
          </div>

          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn
              flat
              dense
              no-caps
              class="secondary-btn"
              style="width: 110px"
              label="Отмена"
              v-close-popup
            />
            <q-btn
              :label="isEdit ? 'Сохранить' : 'Создать'"
              :disable="!canSubmit"
              flat
              dense
              no-caps
              class="primary-btn"
              style="width: 110px"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//cores
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//api
import { PropertyTemplate } from '../services/api';
import { getDictionaries, Dictionary } from '../../dictionaries/services/api';

// локальный тип формы зависимости: снятие = parent_template_id: null («все нули»),
// тип пакета (TypesPropertyDependency) null не допускает
interface PropertyDependencyForm {
  parent_template_id: string | null;
  mode: string | null;
  options_map: Record<string, string[]> | null;
  row_filter_attr: string | null;
}

type PropertyTemplateForm = Omit<PropertyTemplate, 'dependency'> & {
  dependency?: PropertyDependencyForm;
};

const props = defineProps<{
  modelValue: boolean;
  editItem?: PropertyTemplate | null;
  templates?: PropertyTemplate[];
}>();

const emits = defineEmits<{ submit: [any]; 'update:modelValue': [boolean] }>();

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//переменные
// options_map в форме всегда объект — редактор карты не должен падать на null
const emptyDependency = (): PropertyDependencyForm => ({
  parent_template_id: null,
  mode: null,
  options_map: {},
  row_filter_attr: null,
});

const form = ref<PropertyTemplateForm>({
  name: '',
  type: 'string',
  only_admin: true,
  options: [],
  dependency: emptyDependency(),
});

const dictionaries = ref<Dictionary[]>([]);
const isDictionariesLoading = ref(false);

const isEdit = computed(() => !!props.editItem);
const isSelectType = computed(() => form.value.type === 'select');
const isLookupType = computed(() => form.value.type === 'lookup');
// зависимость поддерживается только для select (options_map) и lookup (row_filter)
const isDependencySupportedType = computed(
  () => isSelectType.value || isLookupType.value,
);

const dependencyModes = computed(() => {
  if (isSelectType.value) {
    return [{ label: 'Список вариантов', value: 'options_map' }];
  }
  if (isLookupType.value) {
    return [{ label: 'Фильтр по атрибуту', value: 'row_filter' }];
  }
  return [];
});

const isOptionsMapMode = computed(
  () => form.value.dependency?.mode === 'options_map',
);
const isRowFilterMode = computed(
  () => form.value.dependency?.mode === 'row_filter',
);

const selectedParentTemplate = computed(() =>
  (props.templates || []).find(
    (t) => t.id === form.value.dependency?.parent_template_id,
  ),
);

// варианты родителя — для редактора options_map
const parentOptions = computed(
  () => selectedParentTemplate.value?.options || [],
);

// Имя выбранного родителя ищем в полном списке шаблонов, не в отфильтрованных
// options: родитель, выпавший из options (сменил тип), иначе отображался бы голым uuid
const parentTemplateDisplay = computed(() => {
  const id = form.value.dependency?.parent_template_id;
  if (!id) return '';
  const template = (props.templates || []).find((item) => item.id === id);
  return template?.name ?? 'Параметр недоступен';
});

// родители, совместимые с режимом: options_map — только select, row_filter — select/lookup
const parentTemplateOptions = computed(() => {
  const allowedTypes = isOptionsMapMode.value
    ? ['select']
    : isRowFilterMode.value
      ? ['select', 'lookup']
      : [];
  return (props.templates || [])
    .filter(
      (t) =>
        t.id !== props.editItem?.id && t.type && allowedTypes.includes(t.type),
    )
    .map((t) => ({ label: t.name, value: t.id }));
});

const dictionaryOptions = computed(() =>
  dictionaries.value.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

const hasEmptyOptions = computed(() => {
  if (!isSelectType) return false;
  if (isSelectType && form.value.options.length <= 0) return true;
  return (
    form.value.options?.some((opt: string) => !opt || opt.trim() === '') ??
    false
  );
});
const canSubmit = computed(() => {
  if (!form.value.name) return false;
  if (isSelectType.value && hasEmptyOptions.value) return false;
  if (isLookupType.value && !form.value.dictionary_id) return false;
  return true;
});

//consts
const typeOptions = [
  { label: 'Строка', value: 'string' },
  { label: 'Флаг', value: 'boolean' },
  { label: 'Список', value: 'select' },
  { label: 'Ссылка', value: 'link' },
  { label: 'Справочник', value: 'lookup' },
];

//methods
const loadDictionaries = async () => {
  isDictionariesLoading.value = true;
  try {
    const data = await getDictionaries(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
    );
    dictionaries.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
  } finally {
    isDictionariesLoading.value = false;
  }
};

const onSubmit = () => {
  const data = { ...form.value };
  if (data.type !== 'select') {
    delete data.options;
  }
  if (data.type !== 'lookup') {
    delete data.dictionary_id;
  }

  const parentId = form.value.dependency?.parent_template_id;
  if (parentId) {
    // зависимость задана — собираем полный объект
    data.dependency = {
      parent_template_id: parentId,
      mode: form.value.dependency?.mode || null,
      options_map:
        form.value.dependency?.mode === 'options_map'
          ? form.value.dependency?.options_map || {}
          : null,
      row_filter_attr:
        form.value.dependency?.mode === 'row_filter'
          ? form.value.dependency?.row_filter_attr || null
          : null,
    };
  } else if (props.editItem?.dependency?.parent_template_id) {
    // снятие зависимости — нулевой parent_template_id (все нули)
    data.dependency = {
      parent_template_id: null,
      mode: null,
      options_map: null,
      row_filter_attr: null,
    };
  } else {
    delete data.dependency;
  }

  emits('submit', data);
};

const addOption = () => {
  if (!form.value.options) {
    form.value.options = [];
  }
  form.value.options.push('');
};

const removeOption = (index: number) => {
  form.value.options?.splice(index, 1);
};

// карта options_map привязана к вариантам родителя — сбрасываем при смене
// родителя; row_filter_attr не трогаем: имя атрибута относится к справочнику
// самого поля, а не к родителю
const onParentTemplateChange = () => {
  if (form.value.dependency) {
    form.value.dependency.options_map = {};
  }
};

// режим зависимости однозначно определяется типом поля-ребёнка
const modeForType = (type?: string | null): string | null =>
  type === 'select' ? 'options_map' : type === 'lookup' ? 'row_filter' : null;

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadDictionaries();
      if (props.editItem) {
        form.value = {
          ...props.editItem,
          options: props.editItem.options || [],
          dependency: props.editItem.dependency
            ? {
                parent_template_id:
                  props.editItem.dependency.parent_template_id ?? null,
                mode: props.editItem.dependency.mode ?? null,
                options_map: props.editItem.dependency.options_map || {},
                row_filter_attr:
                  props.editItem.dependency.row_filter_attr ?? null,
              }
            : emptyDependency(),
        };
      } else {
        form.value = {
          name: '',
          type: 'string',
          only_admin: true,
          options: [],
          dictionary_id: null,
          dependency: emptyDependency(),
        };
      }
      // mode доводим по типу здесь: watch на form.value.type не срабатывает,
      // если тип совпал с предыдущим открытием модалки, и mode оставался null —
      // поле «Имя атрибута» пряталось, а сохранение зависимости падало на бэке
      if (form.value.dependency && !form.value.dependency.mode) {
        form.value.dependency.mode = modeForType(form.value.type);
      }
    }
  },
);

watch(
  () => form.value.type,
  (newType) => {
    if (
      newType === 'select' &&
      (!form.value.options || form.value.options.length === 0)
    ) {
      form.value.options = [''];
    }
    // режим однозначно определяется типом ребёнка
    if (newType === 'select') {
      form.value.dependency!.mode = 'options_map';
    } else if (newType === 'lookup') {
      form.value.dependency!.mode = 'row_filter';
    } else {
      // зависимость поддерживается только для select/lookup — полный сброс
      form.value.dependency = emptyDependency();
    }
  },
);
</script>
