<template>
  <q-item class="q-pa-none q-mb-md">
    <AiFormQuestionBody
      v-model="computedValue.label"
      :number="number"
      :showArrow="showArrow"
      :type="computedValue.type"
      @deleteQuestion="emits('deleteQuestion')"
      @upper="emits('upper')"
      @lower="emits('lower')"
    >
      <template v-slot:toggle>
        <div class="row items-center no-wrap">
          <div
            v-if="computedValue.type !== 'checkbox'"
            class="centered-horisontally q-mr-md"
          >
            <q-toggle v-model="computedValue.required" size="32px" />
            Обязательное поле
          </div>

          <div v-if="eligibleParents.length > 0" class="centered-horisontally">
            <q-toggle v-model="isDepending" size="32px" />
            Зависит от предыдущего ответа
            <q-icon
              name="help_outline"
              class="q-ml-xs text-grey cursor-pointer"
            >
              <q-tooltip>
                Вопрос будет показан только при выборе определенного ответа в
                предыдущем вопросе
              </q-tooltip>
            </q-icon>
          </div>

          <div v-if="canBeIssueNameField" class="centered-horisontally q-mr-md">
            <q-toggle
              v-model="computedValue.issue_name_field"
              size="32px"
              @update:model-value="
                (val) => (val ? emits('setIssueNameField') : '')
              "
            />
            Название задачи
          </div>
        </div>
      </template>

      <template v-slot:dependency-config>
        <div
          v-if="computedValue.depend_on"
          class="q-mt-sm q-mb-md rounded-borders"
        >
          <div class="text-subtitle2 q-mb-sm">Появляется если:</div>
          <div class="row gap-x-md items-center">
            <q-select
              ref="dependOnQuestionSelect"
              v-model="computedValue.depend_on.field_index"
              :options="parentOptions"
              label="Вопрос"
              dense
              emit-value
              map-options
              class="base-selector col-grow q-mr-md"
              hide-bottom-space
              option-value="value"
              option-label="label"
              :rules="[
                (val) =>
                  (val !== null && val !== undefined) || 'Выберите вопрос',
              ]"
              @update:model-value="
                computedValue.depend_on &&
                (computedValue.depend_on.value = null) &&
                (computedValue.depend_on.option_index = null)
              "
            />

            <q-select
              v-if="selectedParent"
              ref="dependOnAnswerSelect"
              v-model="dependOnValue"
              :options="answerOptions"
              label="Ответ"
              dense
              emit-value
              map-options
              class="base-selector col-grow"
              hide-bottom-space
              :rules="[
                (val) =>
                  (val !== null && val !== undefined) || 'Выберите ответ',
              ]"
            />
          </div>
        </div>
      </template>

      <template v-slot:property-binding>
        <div v-if="showPropertyBinding" class="row items-center gap-x-md q-mt-md">
          <q-select
            ref="propertyBindingSelect"
            :model-value="computedValue.property_template_id"
            :options="propertyBindingOptions"
            @update:model-value="onPropertyTemplateSelect"
            label="Записывать в параметр задачи"
            dense
            clearable
            emit-value
            map-options
            class="base-selector"
            style="min-width: 260px"
            hide-bottom-space
            option-value="id"
            option-label="name"
          />
          <div
            v-if="boundSelectTemplate"
            class="text-caption text-grey"
          >
            Варианты поля должны входить в options параметра
          </div>
        </div>
      </template>

      <template
        v-slot:nested
        v-if="
          computedValue.type === 'select' ||
          computedValue.type === 'multiselect'
        "
      >
        <div class="q-pl-md q-mt-md">
          <div>
            <q-checkbox
              :model-value="computedValue.type === 'select' ? false : true"
              @update:model-value="updateCheckbox(computedValue)"
              label="Выбор нескольких вариантов"
            />
          </div>
          <q-item
            v-if="computedValue.validate?.opt"
            v-for="(_, index) in computedValue.validate.opt"
            :key="index"
          >
            <AiFormQuestionBody
              v-model="computedValue.validate.opt[index]"
              :number="index + 1"
              :showArrow="(computedValue.validate?.opt?.length || 0) > 1"
              @deleteQuestion="
                deleteQuestion(index, computedValue.validate.opt)
              "
              @upper="upper(index, computedValue.validate.opt)"
              @lower="lower(index, computedValue.validate.opt)"
              is-options-in-select
            />
          </q-item>
        </div>
      </template>
      <template
        v-slot:buttonAdd
        v-if="
          computedValue.type === 'select' ||
          computedValue.type === 'multiselect'
        "
      >
        <div class="q-pl-lg q-mt-xs">
          <AddQuestionTypeField
            is-select
            @addField="
              (object: any) => addQuestion(object, computedValue.validate!.opt!)
            "
          />
        </div>
      </template>
    </AiFormQuestionBody>
  </q-item>
</template>

<script setup lang="ts">
//core
import { computed, ref, watch } from 'vue';

//components
import AiFormQuestionBody from './AiFormQuestionBody.vue';

//composables
// закрывает открытый попап селекта при скролле/ресайзе страницы (иначе
// выпадающее меню остаётся висеть в старой позиции)
import { useMenuHandler } from 'src/composables/useMenuHandler';

//utils
import {
  addQuestion,
  deleteQuestion,
  lower,
  upper,
} from '../helper/helperForm';

//components
import AddQuestionTypeField from './AddQuestionTypeField.vue';

//types
import { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ExtendedFormFields } from 'src/interfaces/forms';

// Какие типы параметров проекта совместимы с типами полей формы.
// Параметры типа link не предлагаем — их нет в маппинге.
// attachment/multiselect/date — привязка не поддерживается бэком, селект не показываем.
const FIELD_TYPE_TO_PROPERTY_TYPES: Record<string, string[]> = {
  input: ['string'],
  textarea: ['string'],
  numeric: ['string'],
  color: ['string'],
  checkbox: ['boolean'],
  select: ['select'],
};

const props = withDefaults(
  defineProps<{
    modelValue: ExtendedFormFields;
    number: number;
    showArrow: boolean;
    allFields?: any[];
    isAutoCreateProject?: boolean;
    // null — целевой проект не выбран (селект не показываем),
    // [] — проект выбран, но подходящих параметров нет
    propertyTemplates?: DtoProjectPropertyTemplate[] | null;
  }>(),
  {
    propertyTemplates: null,
  },
);

const emits = defineEmits<{
  'update:model-value': [value: ExtendedFormFields];
  deleteQuestion: [];
  upper: [];
  lower: [];
  setIssueNameField: [];
}>();

//refs
const isDepending = ref(!!props.modelValue.depend_on);
const propertyBindingSelect = ref();
const dependOnQuestionSelect = ref();
const dependOnAnswerSelect = ref();

// закрываем попапы селектов при скролле страницы/диалога
// («Записывать в параметр задачи», «Вопрос», «Ответ»)
useMenuHandler(propertyBindingSelect);
useMenuHandler(dependOnQuestionSelect);
useMenuHandler(dependOnAnswerSelect);

//computeds
const canBeIssueNameField = computed(() => {
  return (
    props.isAutoCreateProject &&
    computedValue.value.type === 'input' &&
    computedValue.value.required &&
    !isDepending.value
  );
});

const computedValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:model-value', val),
});

const eligibleParents = computed(() => {
  if (!props.allFields) return [];
  const currentIndex = props.number - 1;
  return props.allFields
    .map((f, i) => ({ ...f, originalIndex: i }))
    .slice(0, currentIndex)
    .filter((f) => ['select', 'multiselect', 'checkbox'].includes(f.type));
});

const parentOptions = computed(() => {
  return eligibleParents.value.map((f) => ({
    label: f.label || 'Без названия',
    value: f.originalIndex,
    type: f.type,
  }));
});

const selectedParent = computed(() => {
  const parentIndex = computedValue.value.depend_on?.field_index;
  if (parentIndex === undefined || parentIndex === null) return null;
  return props.allFields?.[parentIndex];
});

const answerOptions = computed(() => {
  const parent = selectedParent.value;
  if (!parent) return [];

  if (parent.type === 'checkbox') {
    return [
      { label: 'Выбрано', value: true },
      { label: 'Не выбрано', value: false },
    ];
  }

  if (parent.validate?.opt) {
    return parent.validate.opt.map((opt: string, index: number) => ({
      label: opt,
      value: index,
    }));
  }

  return [];
});

const dependOnValue = computed({
  get: () => {
    if (!selectedParent.value) return null;
    if (selectedParent.value.type === 'checkbox') {
      return computedValue.value.depend_on?.value;
    }
    return computedValue.value.depend_on?.option_index;
  },
  set: (val) => {
    if (computedValue.value.depend_on && selectedParent.value) {
      if (selectedParent.value.type === 'checkbox') {
        computedValue.value.depend_on.value = val;
        computedValue.value.depend_on.option_index = undefined;
      } else {
        computedValue.value.depend_on.option_index = val;
        computedValue.value.depend_on.value = true;
      }
    }
  },
});

// Селект «Записывать в параметр задачи» показываем только при выбранном
// целевом проекте формы (propertyTemplates !== null), для совместимых типов
// полей и при наличии доступных параметров. Исключение: у поля уже есть
// привязка, которой нет в списке (параметр удалён на бэке) — селект показываем,
// чтобы можно было снять привязку
const showPropertyBinding = computed(() => {
  return (
    props.propertyTemplates !== null &&
    !!FIELD_TYPE_TO_PROPERTY_TYPES[computedValue.value.type ?? ''] &&
    (propertyBindingOptions.value.length > 0 ||
      !!computedValue.value.property_template_id)
  );
});

// Параметры, уже привязанные к другим полям формы, не предлагаем
const usedPropertyTemplateIds = computed(() => {
  const currentField = computedValue.value;
  return (props.allFields ?? [])
    .filter((field) => field !== currentField)
    .map((field) => field.property_template_id)
    .filter(Boolean);
});

const propertyBindingOptions = computed(() => {
  const compatibleTypes =
    FIELD_TYPE_TO_PROPERTY_TYPES[computedValue.value.type ?? ''];
  if (!compatibleTypes) return [];

  const usedIds = new Set(usedPropertyTemplateIds.value);
  return (props.propertyTemplates ?? []).filter(
    (template) =>
      compatibleTypes.includes(template.type ?? '') && !usedIds.has(template.id),
  );
});

// Для select-поля бэк требует, чтобы варианты поля входили в options параметра —
// предзаполняем варианты поля options параметра, если они ещё не заданы
const boundSelectTemplate = computed(() => {
  if (computedValue.value.type !== 'select') return null;
  return (
    props.propertyTemplates?.find(
      (template) => template.id === computedValue.value.property_template_id,
    ) ?? null
  );
});

//methods
const updateCheckbox = (el: any) => {
  el.type = el.type === 'select' ? 'multiselect' : 'select';
};

const onPropertyTemplateSelect = (templateId: string | null) => {
  const field = computedValue.value;
  field.property_template_id = templateId;

  const template = props.propertyTemplates?.find(
    (item) => item.id === templateId,
  );
  if (
    field.type === 'select' &&
    template?.options?.length &&
    !field.validate?.opt?.length
  ) {
    field.validate = {
      ...(field.validate ?? {}),
      opt: [...template.options],
    };
  }
};

//hooks
watch(
  canBeIssueNameField,
  (can) => {
    if (!can) {
      computedValue.value.issue_name_field = false;
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue.depend_on,
  (val) => {
    if (!!val !== isDepending.value) {
      isDepending.value = !!val;
    }
  },
);

watch(isDepending, (val) => {
  if (val && !props.modelValue.depend_on) {
    computedValue.value.depend_on = {
      field_index: null,
      value: null,
    };
  } else if (!val) {
    computedValue.value.depend_on = null;
  }
});
</script>
