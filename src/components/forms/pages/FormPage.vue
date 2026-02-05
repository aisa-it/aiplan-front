<template>
  <q-layout view="lHh Lpr lFf" style="position: relative">
    <FormStepper
      v-if="!noActiveForm && !completedForm && !onlyAuth && !loadReq"
      class="q-pt-md"
      v-model="drawerOpen"
      :visible-pages="visiblePages"
      @go-to-page="goToPage"
    />

    <q-page-container>
      <q-page style="position: relative">
        <div v-show="!onlyAuth" class="background-container">
          <BackgroundForm />
        </div>
        <div v-if="!loadReq" style="position: relative; z-index: 1">
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
                    <div class="row items-center no-wrap">
                      <div class="text-h5 title-text">{{ title }}</div>
                      <q-btn
                        v-if="isMobile"
                        flat
                        dense
                        round
                        icon="menu"
                        @click="drawerOpen = !drawerOpen"
                        class="q-ml-sm q-ml-auto"
                      />
                    </div>
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
                <template
                  v-for="field in currentFields"
                  :key="field.originalIndex"
                >
                  <AiFormPageField
                    v-if="isFieldVisible(field, fields)"
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
      </q-page>
    </q-page-container>
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

//api
import {
  createAnswerAuth,
  createAnswerNoAuth,
  getFormAuth,
  getFormNoAuth,
} from 'src/components/forms/services/api';

//constants
import { SUCCESS_SEND_FORM } from 'src/constants/notifications';

//utils
import {
  groupFieldsByDependency,
  serializationDate,
  isFieldVisible,
  getSubmissionValue,
  resetFieldValues,
  isFieldInvalid,
  findVisiblePage,
} from 'src/components/forms/helper/helperForm';

//components
import LoginFromForm from 'src/components/LoginFromForm.vue';
import BackgroundForm from 'src/components/icons/BackgroundForm.vue';
import AiFormPageField from 'src/components/forms/components/AiFormPageField.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import FormStepper from 'src/components/forms/components/FormStepper.vue';

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
const drawerOpen = ref(false);
const fieldRefs = ref([]);

//computeds
const isMobile = computed(() => quasar.screen.width < 451);

const currentFields = computed(() => {
  return pages.value[currentPage.value] || [];
});

const hasNextVisiblePage = computed(() => {
  for (let i = currentPage.value + 1; i < pages.value.length; i++) {
    if (pages.value[i].some((field) => isFieldVisible(field, fields.value))) {
      return true;
    }
  }
  return false;
});

const isNextButtonDisabled = computed(() => {
  return currentFields.value.some((field) => {
    if (!isFieldVisible(field, fields.value)) return false;
    if (!field.required) return false;
    if (field.type === 'checkbox') return false;

    const val = fields.value[field.originalIndex].value;

    if (field.type === 'select' || field.type === 'multiselect') {
      return !val || val.length === 0;
    }

    return val === '' || val === null || val === undefined;
  });
});

const visiblePages = computed(() => {
  return pages.value
    .map((pageFields, index) => {
      const visibleFields = pageFields.filter((field) =>
        isFieldVisible(field, fields.value),
      );
      if (visibleFields.length === 0) return null;

      const isNextStep = index === currentPage.value + 1;
      const canGoNext = !isNextButtonDisabled.value;

      return {
        index,
        fields: visibleFields,
        label: visibleFields[0].label || 'Вопрос без названия',
        active: index === currentPage.value,
        passed: index < currentPage.value,
        disabled: index > currentPage.value && !(isNextStep && canGoNext),
      };
    })
    .filter((page) => page !== null);
});

//methods
const updateValue = (val, index) => {
  validaionError.value[index] = false;
  fields.value[index].value = val;
};

const submitForm = async () => {
  let hasErrors = false;

  fields.value.forEach((field, index) => {
    if (!isFieldVisible(field, fields.value)) {
      validaionError.value[index] = false;
      return;
    }

    if (field.validate.value_type === 'numeric' && field.type !== 'date') {
      field.value = field.value !== null ? Number(field.value) : null;
    }

    if (isFieldInvalid(field)) {
      validaionError.value[index] = true;
    }

    if (validaionError.value[index]) {
      hasErrors = true;
    }
  });

  if (hasErrors) return;

  const submissionData = [];
  fields.value.forEach((field, index) => {
    if (isFieldVisible(field, fields.value)) {
      submissionData.push(getSubmissionValue(field));
    } else {
      submissionData.push({ value: null });
    }
  });

  try {
    const createAnswer = useAuth.value ? createAnswerAuth : createAnswerNoAuth;
    await createAnswer(route.params.slug, submissionData);

    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_SEND_FORM,
    });
    completedForm.value = true;
  } catch (e) {}
};

const goToPage = (index) => {
  if (index === currentPage.value) return;

  if (index < currentPage.value) {
    currentPage.value = index;
    window.scrollTo(0, 0);
  } else if (index === currentPage.value + 1 && !isNextButtonDisabled.value) {
    nextPage();
  }
};

const nextPage = () => {
  let hasErrors = false;
  currentFields.value.forEach((field) => {
    if (!isFieldVisible(field, fields.value)) {
      validaionError.value[field.originalIndex] = false;
      return;
    }

    if (field.validate.value_type === 'numeric' && field.type !== 'date') {
      const currentValue = fields.value[field.originalIndex].value;
      fields.value[field.originalIndex].value =
        currentValue !== null ? Number(currentValue) : null;
    }

    const targetField = fields.value[field.originalIndex];

    if (isFieldInvalid(targetField)) {
      validaionError.value[field.originalIndex] = true;
    }
    if (validaionError.value[field.originalIndex]) {
      hasErrors = true;
    }
  });

  if (hasErrors) return;

  const nextPageIndex = findVisiblePage(
    currentPage.value,
    1,
    pages.value,
    fields.value,
  );

  if (nextPageIndex !== -1) {
    currentPage.value = nextPageIndex;
    window.scrollTo(0, 0);
  } else {
    submitForm();
  }
};

const prevPage = () => {
  const prevPageIndex = findVisiblePage(
    currentPage.value,
    -1,
    pages.value,
    fields.value,
  );

  if (prevPageIndex !== -1) {
    currentPage.value = prevPageIndex;
    window.scrollTo(0, 0);
  }
};

const resetCurrentPage = () => {
  resetFieldValues(currentFields.value, fields.value);
  currentFields.value.forEach((field) => {
    validaionError.value[field.originalIndex] = false;
  });
};

const resetForm = () => {
  resetFieldValues(fields.value, fields.value);
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
    const getForm = useAuth.value ? getFormAuth : getFormNoAuth;
    try {
      const data = await getForm(route.params.slug);
      validateReq(data);
    } catch (e) {
      if (!useAuth.value) onlyAuth.value = true;
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
  z-index: 0;
  pointer-events: none;
  @media screen and (max-width: 800px) {
    top: -25%;
  }
}
.linear-up {
  background-color: rgb(63, 117, 255);
  border-radius: 15px 15px 0 0;
  width: 100%;
  height: 15px;
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
