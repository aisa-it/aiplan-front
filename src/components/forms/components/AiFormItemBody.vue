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
              v-model="computedValue.depend_on.field_index"
              :options="parentOptions"
              label="Вопрос"
              dense
              emit-value
              map-options
              class="base-selector col-grow q-mr-md"
              hide-bottom-space
              outlined
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
              v-model="dependOnValue"
              :options="answerOptions"
              label="Ответ"
              dense
              emit-value
              map-options
              class="base-selector col-grow"
              hide-bottom-space
              outlined
              :rules="[
                (val) =>
                  (val !== null && val !== undefined) || 'Выберите ответ',
              ]"
            />
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
import { ExtendedFormFields } from 'src/interfaces/forms';

const props = defineProps<{
  modelValue: ExtendedFormFields;
  number: number;
  showArrow: boolean;
  allFields?: any[];
}>();

const emits = defineEmits<{
  'update:model-value': [value: ExtendedFormFields];
  deleteQuestion: [];
  upper: [];
  lower: [];
}>();

//refs
const isDepending = ref(!!props.modelValue.depend_on);

//computeds
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

//methods
const updateCheckbox = (el: any) => {
  el.type = el.type === 'select' ? 'multiselect' : 'select';
};

//hooks
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
