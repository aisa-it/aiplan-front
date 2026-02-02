<template>
  <q-layout style="position: relative">
    <div v-show="!onlyAuth" class="background-container">
      <BackgroundForm />
    </div>
    <div v-if="!loadReq">
      <div v-if="!noActiveForm && !completedForm && !onlyAuth">
        <div class="q-pa-md">
          <q-form
            @submit.prevent="submitForm"
            @reset="resetForm"
            style="max-width: 900px; margin: 0 auto"
          >
            <div class="title-container">
              <div class="linear-up"></div>
              <div class="q-pa-md">
                <div class="text-h5 title-text">{{ title }}</div>
                <EditorTipTapV2
                  v-if="description"
                  editor-id="desc-form-editor"
                  :model-value="description"
                  :read-only-editor="true"
                  :can-edit="false"
                  :class-prevent="'no-padding'"
                  class="form-tiptap__editor"
                  style="border: 0px"
                />
              </div>
            </div>
            <template v-for="field in currentFields" :key="field.originalIndex">
              <div
                v-if="isFieldVisible(field)"
                class="q-mt-md q-pa-md title-container"
              >
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
                <div
                  v-if="field.type !== 'checkbox'"
                  class="text-weight-bold"
                ></div>
                <component
                  :is="components[field.type]"
                  :ref="(el) => (fieldRefs[field.originalIndex] = el)"
                  :model-value="fields[field.originalIndex].value"
                  @update:model-value="
                    (val) => updateValue(val, field.originalIndex)
                  "
                  @keypress.enter="handleEnterPress(field.type, $event)"
                  :label="getFieldLabel(field)"
                  :type="getFieldType(field.type)"
                  :counter="!!getFieldMaxLenght(field.type)"
                  :maxlength="getFieldMaxLenght(field.type)"
                  :dense="true"
                  :checked="
                    field.type === 'checkbox'
                      ? fields[field.originalIndex].value
                      : undefined
                  "
                  :validate="field.validate"
                  :required="field.required"
                  :style="{
                    width: '100%',
                    'margin-top': field.type === 'checkbox' ? '12px' : '8px',
                  }"
                  class="q-mt-sm"
                  input-class="form-input"
                  :rules="getRules(field.type, field.required)"
                  :lazy-rules="field.type === 'date'"
                  :mask="getMask(field.type)"
                  :error-message="
                    validaionError[field.originalIndex]
                      ? getErrorMessage(field.type)
                      : ''
                  "
                  :error="validaionError[field.originalIndex]"
                  style="padding-top: 1px"
                  no-error-icon
                >
                  <template v-if="field.type === 'numeric'" v-slot:append>
                    <div style="height: 100%">
                      <q-btn
                        @click="updateValue(1, field.originalIndex, true)"
                        icon="add"
                        flat
                      />
                      <q-btn
                        @click="updateValue(-1, field.originalIndex, true)"
                        icon="remove"
                        flat
                      />
                    </div>
                  </template>
                  <template v-else-if="field.type === 'date'" v-slot:append>
                    <q-icon
                      name="event"
                      class="cursor-pointer"
                      @click="dateDialogsVisible[field.originalIndex] = true"
                    >
                    </q-icon>
                    <q-dialog v-model="dateDialogsVisible[field.originalIndex]">
                      <q-date
                        v-model="formDates[field.originalIndex]"
                        mask="YYYY-MM-DD"
                        navigation-min-year-month="1000/01"
                        @update:model-value="
                          (val) => setDateToInput(val, field.originalIndex)
                        "
                      >
                        <div class="row items-center justify-between">
                          <q-btn
                            label="Сбросить"
                            class="secondary-btn"
                            no-caps
                            flat
                            dense
                            @click="resetDate(field.originalIndex)"
                          />
                          <q-btn
                            v-close-popup
                            label="Выбрать"
                            class="primary-btn"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-dialog>
                  </template>
                  <template v-else-if="field.type === 'color'" v-slot:append>
                    <q-icon
                      name="colorize"
                      class="cursor-pointer"
                      @click="
                        colorPickerDialogsVisible[field.originalIndex] = true
                      "
                    ></q-icon>
                    <q-dialog
                      v-model="colorPickerDialogsVisible[field.originalIndex]"
                    >
                      <q-color
                        v-model="fields[field.originalIndex].value"
                        no-header-tabs
                        @input="
                          colorPickerDialogsVisible[field.originalIndex] = false
                        "
                      />
                    </q-dialog>
                  </template>
                  <template v-if="field.type === 'color'" v-slot:prepend
                    ><q-badge
                      rounded
                      :style="{
                        backgroundColor: fields[field.originalIndex].value,
                      }"
                  /></template>
                </component>
              </div>
            </template>
            <div class="flex justify-between button-container q-mt-md">
              <q-btn
                v-if="!isMobile && !emptyForm && currentPage === 0"
                label="Очистить форму"
                @click="resetForm"
                flat
                color="primary"
                class="text-weight-bold"
                no-caps
                style="max-width: 170px"
              />
              <q-btn
                v-if="!isMobile && !emptyForm && currentPage > 0"
                label="Очистить страницу"
                @click="resetCurrentPage"
                flat
                color="primary"
                class="text-weight-bold"
                no-caps
                style="max-width: 170px"
              />

              <div class="button-container q-ml-auto">
                <q-btn
                  flat
                  no-caps
                  class="secondary-btn q-mr-sm q-mb-xs"
                  v-if="useAuth && !emptyForm"
                  :to="`/${userStore.user.last_workspace_slug}`"
                  label="Отмена"
                />
                <q-btn
                  v-if="!isMobile && !emptyForm && currentPage > 0"
                  label="Назад"
                  @click="prevPage"
                  flat
                  color="primary"
                  class="primary-btn q-mb-xs q-mr-sm"
                  no-caps
                  style="max-width: 150px"
                />
                <q-btn
                  v-if="!emptyForm"
                  class="primary-btn q-mb-xs"
                  :label="!hasNextVisiblePage ? 'Записать ответ' : 'Далее'"
                  size="15px"
                  @click="nextPage"
                  :disable="isNextButtonDisabled"
                  no-caps
                />
              </div>
              <div
                v-if="emptyForm"
                class="flex justify-between button-container"
              >
                <q-btn
                  no-caps
                  class="primary-btn q-mb-xs"
                  style="margin-left: auto"
                  :to="`/${userStore.user.last_workspace_slug}`"
                  label="Закрыть форму"
                />
              </div>
            </div>
          </q-form>
        </div>
      </div>
      <div
        v-if="!completedForm && noActiveForm"
        class="fullscreen flex flex-center"
      >
        <div align="center" class="column background-end-form">
          <div class="col-shrink linear-up"></div>
          <div class="col-grow column justify-center q-pa-md">
            <div class="text-h6">Опрос больше не доступен</div>
            <div>
              <div>К сожалению пройти этот опрос невозможно</div>
              <q-btn
                v-if="useAuth"
                label="Вернуться"
                :to="`/${userStore.user.last_workspace_slug}`"
                color="primary"
                push
                class="q-mt-md"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="completedForm" class="fullscreen flex flex-center">
        <div align="center" class="column background-end-form">
          <div class="col-shrink linear-up"></div>
          <div class="col-grow column justify-center q-pa-md">
            <div class="text-h6">Вы успешно прошли опрос</div>
            <div v-if="useAuth">
              <div>Вы можете вернуться в рабочее пространство</div>
              <q-btn
                label="Закрыть форму"
                :to="`/${userStore.user.last_workspace_slug}`"
                color="primary"
                push
                class="q-mt-md"
                no-caps
              />
            </div>
          </div>
        </div>
      </div>
      <div v-if="onlyAuth" class="fullscreen flex flex-center">
        <LoginFromForm />
      </div>
    </div>
    <div v-if="loadReq" class="fullscreen flex flex-center">
      <q-spinner-oval
        :color="quasar.dark.isActive ? 'blue-grey-13' : 'primary'"
        size="125px"
      />
    </div>
  </q-layout>
</template>

<script setup>
//core
import dayjs from 'dayjs';
import { ref, onMounted, computed } from 'vue';
import {
  QInput,
  QCheckbox,
  QBtn,
  QDate,
  QColor,
  useQuasar,
  useMeta,
} from 'quasar';
import { useRoute } from 'vue-router';
//stores
import { useFormStore } from 'src/stores/form-store';
import { useUserStore } from 'src/stores/user-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useUtilsStore } from 'src/stores/utils-store';
//constants
import { SUCCESS_SEND_FORM } from 'src/constants/notifications';
//components
import LoginFromForm from 'src/components/LoginFromForm.vue';
import BackgroundForm from 'src/components/icons/BackgroundForm.vue';
import AiFormPageSelect from 'src/components/AiFormPageSelect.vue';
import {
  getFieldType,
  getFieldMaxLenght,
  getFieldLabel,
  getErrorMessage,
  getRules,
  getMask,
  groupFieldsByDependency,
} from 'src/components/forms/helper/helperForm';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
//composables
const route = useRoute();
const quasar = useQuasar();

//stores
const formStore = useFormStore();
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const { setNotificationView } = useNotificationStore();
//state
const fields = ref([]);
const description = ref('');
const title = ref('');
const useAuth = ref(false);
const onlyAuth = ref(false);
const noActiveForm = ref(false);
const completedForm = ref(false);
const loadReq = ref(false);
const emptyForm = ref(false);
const formDates = ref([]);
const colorPickerDialogsVisible = ref([]);
const dateDialogsVisible = ref([]);
const validaionError = ref([]);
const currentPage = ref(0);
const pages = ref([]);

const fieldRefs = ref([]);

const components = ref({
  input: QInput,
  textarea: QInput,
  checkbox: QCheckbox,
  numeric: QInput,
  date: QInput,
  color: QInput,
  select: AiFormPageSelect,
  multiselect: AiFormPageSelect,
});

//computeds
const isMobile = computed(() => quasar.screen.width < 451);

const currentFields = computed(() => {
  return pages.value[currentPage.value] || [];
});

//methods
const transformDate = (date) => {
  return date.split('.').reverse().join('-');
};

const updateValue = (val, index, isButton = false) => {
  validaionError.value[index] = false;
  if (isButton) {
    fields.value[index].value = String(Number(fields.value[index].value) + val);
    return;
  }
  if (fields.value[index].type === 'numeric') {
    if (isNaN(val)) return;
    fields.value[index].value = Math.trunc(Number(val));
    return;
  }
  if (fields.value[index].type === 'date') {
    updateFormDate(val, index);
  }
  if (fields.value[index].type === 'color') {
    if (!fields.value[index].value.length) {
      fields.value[index].value = '#' + val;
    } else {
      fields.value[index].value = val;
    }
    return;
  }
  fields.value[index].value = val;
};

const handleEnterPress = (type, event) => {
  if (type !== 'textarea') {
    event.preventDefault();
  }
};

const updateFormDate = (val, index) => {
  if (val.length === 10) {
    formDates.value[index] = transformDate(val);
  }
};

const isFieldVisible = (field) => {
  if (!field.depend_on) return true;
  const { field_index, option_index, value: dependValue } = field.depend_on;

  if (field_index === undefined || field_index === null) return true;

  const parent = fields.value[field_index];
  if (!parent) return false;

  if (!isFieldVisible(parent)) return false;

  if (parent.type === 'checkbox') {
    return String(parent.value) === String(dependValue);
  }

  if (parent.type === 'select' || parent.type === 'multiselect') {
    if (!Array.isArray(parent.value)) return false;

    let targetValue;
    if (option_index !== undefined && option_index !== null) {
      const option = parent.validate.opt[option_index];
      targetValue = typeof option === 'object' ? option.value : option;
    } else {
      targetValue = dependValue;
    }

    return parent.value.some(
      (opt) => String(opt.value) === String(targetValue),
    );
  }

  return true;
};

const getSubmissionValue = (field, index) => {
  if (field.type === 'date') {
    return {
      value: new Date(formDates.value[index]).getTime(),
    };
  }
  if (field.type === 'multiselect') {
    return {
      value: field.value?.length ? field.value?.map((el) => el.value) : null,
    };
  }
  if (field.type === 'select') {
    return {
      value: field.value[0]?.value ?? null,
    };
  }
  return { value: field.value || null };
};

const submitForm = async () => {
  let hasErrors = false;

  fields.value.forEach((field, index) => {
    if (!isFieldVisible(field)) {
      validaionError.value[index] = false;
      return;
    }

    if (field.validate.value_type === 'numeric' && field.type !== 'date') {
      field.value = field.value !== null ? Number(field.value) : null;
    }

    validateForm(field, index);

    if (validaionError.value[index]) {
      hasErrors = true;
    }
  });

  if (hasErrors) return;

  const submissionData = [];
  fields.value.forEach((field, index) => {
    if (isFieldVisible(field)) {
      submissionData.push(getSubmissionValue(field, index));
    } else {
      submissionData.push({ value: null });
    }
  });

  try {
    const { data } = await formStore.sendForm(
      route.params.slug,
      submissionData,
      !!useAuth.value,
    );

    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_SEND_FORM,
    });
    completedForm.value = true;
  } catch (e) {}
};

const hasNextVisiblePage = computed(() => {
  for (let i = currentPage.value + 1; i < pages.value.length; i++) {
    if (pages.value[i].some((field) => isFieldVisible(field))) {
      return true;
    }
  }
  return false;
});

const isNextButtonDisabled = computed(() => {
  return currentFields.value.some((field) => {
    if (!isFieldVisible(field)) return false;
    if (!field.required) return false;
    if (field.type === 'checkbox') return false;

    const val = fields.value[field.originalIndex].value;

    if (field.type === 'select' || field.type === 'multiselect') {
      return !val || val.length === 0;
    }

    return val === '' || val === null || val === undefined;
  });
});

const findVisiblePage = (startPage, direction) => {
  let i = startPage + direction;
  while (i >= 0 && i < pages.value.length) {
    if (pages.value[i].some((field) => isFieldVisible(field))) {
      return i;
    }
    i += direction;
  }
  return -1;
};

const nextPage = () => {
  let hasErrors = false;
  currentFields.value.forEach((field) => {
    if (!isFieldVisible(field)) {
      validaionError.value[field.originalIndex] = false;
      return;
    }

    if (field.validate.value_type === 'numeric' && field.type !== 'date') {
      const currentValue = fields.value[field.originalIndex].value;
      fields.value[field.originalIndex].value =
        currentValue !== null ? Number(currentValue) : null;
    }

    validateForm(fields.value[field.originalIndex], field.originalIndex);
    if (validaionError.value[field.originalIndex]) {
      hasErrors = true;
    }
  });

  if (hasErrors) return;

  const nextPageIndex = findVisiblePage(currentPage.value, 1);

  if (nextPageIndex !== -1) {
    currentPage.value = nextPageIndex;
    window.scrollTo(0, 0);
  } else {
    submitForm();
  }
};

const prevPage = () => {
  const prevPageIndex = findVisiblePage(currentPage.value, -1);

  if (prevPageIndex !== -1) {
    currentPage.value = prevPageIndex;
    window.scrollTo(0, 0);
  }
};

const resetFields = (targetFields) => {
  targetFields.forEach((field) => {
    const originalIndex =
      field.originalIndex !== undefined
        ? field.originalIndex
        : fields.value.indexOf(field);
    const targetField = fields.value[originalIndex];

    switch (targetField.type) {
      case 'checkbox':
        targetField.value = false;
        break;
      case 'numeric':
        targetField.value = null;
        break;
      case 'color':
        targetField.value = '';
        break;
      case 'select':
      case 'multiselect':
        targetField.value = [];
        break;
      case 'date':
        targetField.value = null;
        break;
      default:
        if (targetField.validate?.value_type === 'numeric') {
          targetField.value = null;
        } else if (targetField.validate?.value_type === 'string') {
          targetField.value = '';
        }
    }
  });
};

const resetCurrentPage = () => {
  resetFields(currentFields.value);
  currentFields.value.forEach((field) => {
    validaionError.value[field.originalIndex] = false;
  });
};

const resetForm = () => {
  resetFields(fields.value);
  validaionError.value = [];
  currentPage.value = 0;
};

const validateReq = (data) => {
  if (!data.active) noActiveForm.value = true;
  if (!data.fields.length) emptyForm.value = true;
  fields.value = data.fields;
  pages.value = groupFieldsByDependency(fields.value);
  description.value = data.description;
  title.value = data.title;
  resetForm();
};

const validateForm = ({ value, type, required }, index) => {
  if (type === 'date') {
    if (
      value &&
      (value.length !== 10 ||
        Number(value.split('.')[2]) < 1000 ||
        isNaN(new Date(transformDate(value)).getTime()))
    )
      validaionError.value[index] = true;
  }
  if (type === 'color') {
    if (value && value.length !== 7) validaionError.value[index] = true;
  }
  if ((type === 'select' || type === 'multiselect') && required) {
    if (!value.length) {
      validaionError.value[index] = true;
    }
  }
};

const setDateToInput = (val, index) => {
  fields.value[index].value = dayjs(val).format('DD-MM-YYYY');
};

const resetDate = (index) => {
  fields.value[index].value = null;
  formDates.value[index] = null;
};

//lifecycle hooks
useMeta(() => {
  return {
    title: `Форма ${title.value}`,
  };
});

onMounted(async () => {
  try {
    loadReq.value = true;
    await utilsStore.getVersion();
    await userStore.getMe();
    localStorage.setItem('dark', String(userStore.user?.theme.dark));
    useAuth.value = true;
  } catch (e) {
    useAuth.value = false;
  } finally {
    if (useAuth.value) {
      const { data } = await formStore.getSettingsForm(route.params.slug, true);
      validateReq(data);
    } else {
      try {
        const { data } = await formStore.getSettingsForm(
          route.params.slug,
          false,
        );
        validateReq(data);
      } catch (e) {
        onlyAuth.value = true;
      }
    }
    if (localStorage.getItem('dark') === 'true') {
      quasar.dark.set(true);
    }
    loadReq.value = false;
  }
});
</script>

<style scoped lang="scss">
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  z-index: -1;
  @media screen and (max-width: 800px) {
    top: -25%;
  }
}

.button-container {
  @media screen and (max-width: 450px) {
    margin-left: auto;
  }
}

.title-text {
  word-wrap: break-word;
  white-space: normal;
  overflow: hidden;
}

.linear-up {
  background-color: rgb(63, 117, 255);
  border-radius: 15px 15px 0 0;
  width: 100%;
  height: 15px;
}

.form-tiptap__editor {
  :deep(.html-editor__container) {
    border: 0px;
    min-height: auto;
  }
  :deep(.tiptap) {
    min-height: auto;
  }
}
:deep(.q-field--dense.q-field--float .q-field__label) {
  padding-bottom: 12px;
}
:deep(.q-field__control) {
  padding-right: 3px;
  padding-bottom: 1px;
}

.background-end-form {
  min-height: 155px;
  min-width: 350px;
  border-radius: 15px;
  margin: 0 auto;
  @media (max-width: 360px) {
    min-width: calc(100% - 14px);
    margin: 0 7px;
  }
}
</style>
