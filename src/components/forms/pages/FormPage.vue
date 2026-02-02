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
              <AiFormPageField
                v-if="isFieldVisible(field)"
                :field="field"
                :model-value="fields[field.originalIndex].value"
                :error="validaionError[field.originalIndex]"
                @update:model-value="
                  (val) => updateValue(val, field.originalIndex)
                "
                :ref="(el) => (fieldRefs[field.originalIndex] = el)"
              />
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
import { useQuasar, useMeta } from 'quasar';
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
import AiFormPageField from 'src/components/forms/components/AiFormPageField.vue';
import {
  groupFieldsByDependency,
  serializationDate,
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
const validaionError = ref([]);
const currentPage = ref(0);
const pages = ref([]);

const fieldRefs = ref([]);

//computeds
const isMobile = computed(() => quasar.screen.width < 451);

const currentFields = computed(() => {
  return pages.value[currentPage.value] || [];
});

//methods
const updateValue = (val, index) => {
  validaionError.value[index] = false;
  fields.value[index].value = val;
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
    const isoDate = serializationDate(field.value, true);
    return {
      value: new Date(isoDate).getTime(),
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
    // transformed date logic
    if (
      value &&
      (value.length !== 10 ||
        Number(value.split('.')[2]) < 1000 ||
        isNaN(new Date(serializationDate(value, true)).getTime()))
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
