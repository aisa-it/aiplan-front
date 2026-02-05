<template>
  <div class="q-mt-md q-pa-md title-container">
    <div
      v-if="
        field.type !== 'checkbox' &&
        field.type !== 'select' &&
        field.type !== 'multiselect'
      "
      class="text-weight-bold"
    >
      {{ field.label }}
      <span v-if="field.required" class="negative-text">*</span>
    </div>
    <div v-if="field.type !== 'checkbox'" class="text-weight-bold"></div>
    <component
      :is="components[field.type]"
      :model-value="modelValue"
      :field="field"
      @update:model-value="handleUpdateValue"
      @keypress.enter="handleEnterPress(field.type, $event)"
      :label="getFieldLabel(field)"
      :type="getFieldType(field.type)"
      :counter="!!getFieldMaxLenght(field.type)"
      :maxlength="getFieldMaxLenght(field.type)"
      :dense="true"
      :checked="field.type === 'checkbox' ? modelValue : undefined"
      :validate="field.validate"
      :required="field.required"
      :form-slug="formSlug"
      :workspace-slug="workspaceSlug"
      :style="{
        width: '100%',
        'margin-top': field.type === 'checkbox' ? '12px' : '8px',
      }"
      class="q-mt-sm"
      input-class="form-input"
      :rules="getRules(field.type, field.required)"
      :lazy-rules="field.type === 'date'"
      :mask="getMask(field.type)"
      :error-message="error ? getErrorMessage(field.type) : ''"
      :error="error"
      style="padding-top: 1px"
      no-error-icon
    >
      <template v-if="field.type === 'numeric'" v-slot:append>
        <div style="height: 100%">
          <q-btn @click="updateNumeric(1)" icon="add" flat />
          <q-btn @click="updateNumeric(-1)" icon="remove" flat />
        </div>
      </template>
      <template v-else-if="field.type === 'date'" v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
          @click="dateDialogVisible = true"
        >
        </q-icon>
        <q-dialog v-model="dateDialogVisible">
          <q-date
            :model-value="internalDate"
            mask="YYYY-MM-DD"
            navigation-min-year-month="1000/01"
            @update:model-value="setDateToInput"
          >
            <div class="row items-center justify-between">
              <q-btn
                label="Сбросить"
                class="secondary-btn"
                no-caps
                flat
                dense
                @click="resetDate"
              />
              <q-btn v-close-popup label="Выбрать" class="primary-btn" flat />
            </div>
          </q-date>
        </q-dialog>
      </template>
      <template v-else-if="field.type === 'color'" v-slot:append>
        <q-icon
          name="colorize"
          class="cursor-pointer"
          @click="colorPickerDialogVisible = true"
        ></q-icon>
        <q-dialog v-model="colorPickerDialogVisible">
          <q-color
            :model-value="modelValue"
            no-header-tabs
            @update:model-value="handleColorUpdate"
            @change="colorPickerDialogVisible = false"
          />
        </q-dialog>
      </template>
      <template v-if="field.type === 'color'" v-slot:prepend
        ><q-badge
          rounded
          :style="{
            backgroundColor: modelValue,
          }"
      /></template>
    </component>
  </div>
</template>

<script setup>
//core
import { ref, computed } from 'vue';
import {
  QInput,
  QCheckbox,
  QBtn,
  QDate,
  QColor,
  QDialog,
  QIcon,
  QBadge,
} from 'quasar';

//components
import AiFormPageSelect from 'src/components/AiFormPageSelect.vue';
import FormAttachment from './FormAttachment.vue';

//utils
import {
  getFieldType,
  getFieldMaxLenght,
  getFieldLabel,
  getErrorMessage,
  getRules,
  getMask,
} from 'src/components/forms/helper/helperForm';
import dayjs from 'dayjs';

const props = defineProps({
  field: {
    type: Object,
    required: true,
  },
  modelValue: {
    required: true,
  },
  error: {
    type: Boolean,
    default: false,
  },
  formSlug: {
    type: String,
    default: '',
  },
  workspaceSlug: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

//variables
const dateDialogVisible = ref(false);
const colorPickerDialogVisible = ref(false);
const internalDate = ref(null);

const components = {
  input: QInput,
  textarea: QInput,
  checkbox: QCheckbox,
  numeric: QInput,
  date: QInput,
  color: QInput,
  select: AiFormPageSelect,
  multiselect: AiFormPageSelect,
  attachment: FormAttachment,
};

const transformDate = (date) => {
  return date.split('.').reverse().join('-');
};

const handleUpdateValue = (val) => {
  if (props.field.type === 'numeric') {
    if (isNaN(val)) return;
    emit('update:modelValue', Math.trunc(Number(val)));
    return;
  }
  if (props.field.type === 'date') {
    if (val.length === 10) {
      internalDate.value = transformDate(val);
    }
    emit('update:modelValue', val);
    return;
  }
  if (props.field.type === 'color') {
    if (!String(val).startsWith('#') && val.length) {
      emit('update:modelValue', '#' + val);
    } else {
      emit('update:modelValue', val);
    }
    return;
  }

  emit('update:modelValue', val);
};

const updateNumeric = (delta) => {
  const current = Number(props.modelValue) || 0;
  emit('update:modelValue', String(current + delta));
};

const setDateToInput = (val) => {
  internalDate.value = val;
  emit('update:modelValue', dayjs(val).format('DD-MM-YYYY'));
};

const resetDate = () => {
  internalDate.value = null;
  emit('update:modelValue', null);
};

const handleColorUpdate = (val) => {
  emit('update:modelValue', val);
};

const handleEnterPress = (type, event) => {
  if (type !== 'textarea') {
    event.preventDefault();
  }
};
</script>

<style scoped lang="scss">
:deep(.q-field--dense.q-field--float .q-field__label) {
  padding-bottom: 12px;
}
:deep(.q-field__control) {
  padding-right: 3px;
  padding-bottom: 1px;
}
</style>
