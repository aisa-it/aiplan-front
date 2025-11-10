<template>
  <q-dialog ref="dialogRef" @before-show="getForm" persistent @hide="clear">
    <q-card class="form-modal-card q-pa-lg">
      <q-form ref="formRef">
        <q-card-section class="column q-pa-none">
          <FormDialogHeader
            :title="props.formForEdit?.slug"
            @close="formDialogStore.close"
          />
          <FormMainFields v-model="form" :validateDate="validateDate" />
          <FormAccessFields v-model="authRequire" />
          <FormProjectSettings
            v-model="form"
            v-model:isAutoCreateProject="isAutoCreateProject"
            :projects="projects"
          />
          <EditorTipTapV2
            v-model="description"
            editor-id="form-editor-id"
            class="comments-editor q-mt-lg"
            editor-placeholder="Описание"
            disable-images
            :excluded-tabs="[TIPTAP_TABS.drawio]"
          />
        </q-card-section>
        <q-card-section class="column q-pa-none q-mt-lg">
          <q-list>
            <template v-for="(el, i) in form?.fields" :key="el.label">
              <AiFormItemBody
                v-model="fields[i]"
                @delete-question="deleteQuestion(i, form?.fields)"
                @upper="upper(i, form?.fields)"
                @lower="lower(i, form?.fields)"
                :number="i + 1"
                :show-arrow="fields.length > 1"
              />
            </template>
          </q-list>
          <AddQuestionTypeField @addField="addQuestion($event, fields)" />
        </q-card-section>
        <FormsButton
          :disable="
            !form.title || (isAutoCreateProject && !form?.target_project_id)
          "
          :isEdit="!!props.formForEdit?.slug"
          @close="formDialogStore.close"
          @save="save()"
        />
        <FormDialogLoader :isLoading="isLoading" />
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useFormStore } from '../stores/form-store';
import { useFormDialogStore } from '../stores/form-dialog-store';
import { useWorkspaceStore } from 'stores/workspace-store';
import { api } from '../services/api';

import { TIPTAP_TABS } from 'src/constants/tiptap';
import {
  upper,
  lower,
  deleteQuestion,
  onSuccess,
  onError,
  addQuestion,
  validateFormWithSlug,
  serializationDate,
  validDate,
  getDate,
} from 'src/components/forms/helper/helperForm';

import {
  AiplanReqForm,
  DtoFormLight,
  DtoProjectLight,
  TypesFormFields,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import FormMainFields from '../components/FormMainFields.vue';
import FormAccessFields from '../components/FormAccessFields.vue';
import FormProjectSettings from '../components/FormProjectSettings.vue';
import FormDialogLoader from '../ui/FormDialogLoader.vue';
import FormDialogHeader from '../ui/FormDialogHeader.vue';
import AiFormItemBody from '../components/AiFormItemBody.vue';
import FormsButton from '../components/formsButton.vue';
import AddQuestionTypeField from '../components/AddQuestionTypeField.vue';

const props = defineProps<{
  formForEdit: DtoFormLight;
}>();

const formStore = useFormStore();
const formDialogStore = useFormDialogStore();
const workspaceStore = useWorkspaceStore();

const dialogRef = ref();
const formRef = ref();
const form = ref<AiplanReqForm>({} as AiplanReqForm);
const isAutoCreateProject = ref(false);
const projects = ref([] as DtoProjectLight[]);
const isLoading = ref(false);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const authRequire = computed({
  get: () => form.value.auth_require ?? false,
  set: (val: boolean) => (form.value.auth_require = val),
});

const description = computed({
  get: () => form.value.description ?? '',
  set: (val: string) => (form.value.description = val),
});

const fields = computed({
  get: () => form.value.fields ?? ([] as TypesFormFields[]),
  set: (val: TypesFormFields[]) => (form.value.fields = val),
});

const clear = () => {
  form.value = {
    title: '',
    description: '',
    fields: [],
    auth_require: false,
    end_date: getDate(),
    target_project_id: '',
  };
  isAutoCreateProject.value = false;
};

const getRequestBody = () => ({
  title: form.value.title,
  description: form.value.description,
  end_date: form.value.end_date
    ? serializationDate(form.value.end_date, true)
    : null,
  auth_require: form.value.auth_require,
  fields: form.value.fields,
  target_project_id: isAutoCreateProject.value
    ? (form.value.target_project_id ?? null)
    : null,
});

const save = async () => {
  const isValid = await formRef.value.validate();

  if (!isValid && !form.value.title) {
    onError();
    return;
  }
  isLoading.value = true;
  const requestBody = getRequestBody();

  try {
    if (props.formForEdit?.slug as string) {
      await formStore.updateForm(
        props.formForEdit?.workspace as string,
        props.formForEdit?.slug as string,
        requestBody,
      );
    } else {
      await formStore.createForm(
        currentWorkspaceSlug.value as string,
        requestBody,
      );
    }
    onSuccess();
  } finally {
    isLoading.value = false;
    formDialogStore.close();
  }
};

const validateDate = (val: string) => validDate(val);

const refreshProjects = async () => {
  clear();

  await workspaceStore
    .getWorkspaceProjects(currentWorkspaceSlug.value as string)
    .then((data) => {
      projects.value =
        data?.filter(
          (project) => (project.current_user_membership?.role ?? 0) > 5,
        ) ?? ([] as DtoProjectLight[]);
    });
};

const getForm = async () => {
  refreshProjects();

  if (!props.formForEdit?.slug) return;

  const data = await api.getFormAuth(props.formForEdit?.slug as string);

  form.value = validateFormWithSlug(data);
  isAutoCreateProject.value = !!form.value.target_project_id;
};
</script>

<style scoped lang="scss">
.btn-padding {
  padding: 1px 6px !important;
}
.create-btn {
  &:disabled {
    background-color: #bac4d5 !important;
  }
}

.comments-editor {
  :deep(.html-editor__container) {
    min-height: 210px;
    height: 210px;
  }
  :deep(.tiptap) {
    min-height: 210px;
  }
}
</style>
