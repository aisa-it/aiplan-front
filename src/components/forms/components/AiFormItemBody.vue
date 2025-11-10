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
        <div
          v-if="computedValue.type !== 'checkbox'"
          class="centered-horisontally"
        >
          <q-toggle v-model="computedValue.required" size="32px" />
          Обязательное поле
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
            v-for="(option, index) in computedValue.validate.opt"
            :key="index"
          >
            <AiFormQuestionBody
              v-model="computedValue.validate.opt[index]"
              :number="index + 1"
              :showArrow="computedValue.validate.opt.length > 1"
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
              (object) => addQuestion(object, computedValue.validate.opt)
            "
          />
        </div>
      </template>
    </AiFormQuestionBody>
  </q-item>
</template>

<script setup lang="ts">
import { TypesFormFields } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed } from 'vue';
import AiFormQuestionBody from './AiFormQuestionBody.vue';
import {
  addQuestion,
  deleteQuestion,
  lower,
  upper,
} from '../helper/helperForm';
import AddQuestionTypeField from './AddQuestionTypeField.vue';

const props = defineProps<{
  modelValue: TypesFormFields;
  number: number;
  showArrow: boolean;
}>();

const emits = defineEmits<{
  'update:model-value': [value: TypesFormFields];
  deleteQuestion: [];
  upper: [];
  lower: [];
}>();

const computedValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:model-value', val),
});

const updateCheckbox = (el: any) => {
  el.type = el.type === 'select' ? 'multiselect' : 'select';
};
</script>
