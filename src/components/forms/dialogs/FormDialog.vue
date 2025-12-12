<template>
  <q-dialog ref="dialogRef" @before-show="getForm" persistent @hide="clear">
    <q-card class="form-modal-card q-pa-lg">
      <q-form ref="formRef">
        <q-card-section class="column q-pa-none">
          <div class="row justify-between flex-column q-mb-md">
            <h5 class="q-ma-none">
              {{
                props.formSlug
                  ? `Редактирование формы ${props.formSlug}`
                  : 'Создать форму'
              }}
            </h5>
            <q-btn
              v-if="!$q.screen.lt.sm"
              flat
              dense
              rounded
              icon="close"
              @click="() => dialogRef.hide()"
            />
          </div>
          <div class="row gap-x-sm">
            <div class="col-12 col-sm-auto col-sm-grow">
              <q-input
                v-model="form.title"
                ref="formTitle"
                dense
                label="Название формы"
                class="q-mb-sm base-input project-input"
                :rules="[(val: string) => isEmpty(val, 'заголовок формы')]"
              />
            </div>
            <div
              class="col-12 col-sm-auto col-sm-grow"
              style="max-width: 340px"
            >
              <FormsDate
                :model-value="form.end_date"
                @update:model-value="
                  (val) => {
                    form.end_date = serializationDate(val, false);
                  }
                "
                @reset="form.end_date = ''"
                :rules="validateDate"
              />
            </div>
          </div>
          <div>
            <div class="q-mt-sm">Доступ к прохождению</div>
            <div :class="!$q.screen.lt.sm ? 'row no-wrap' : 'column'">
              <q-radio
                v-model="visible"
                val="all"
                label="Анонимный пользователь"
              />
              <q-radio
                v-model="visible"
                val="authorize"
                label="Авторизованный пользователь"
              />
            </div>
          </div>
          <div class="row gap-x-4">
            <q-checkbox
              v-model="isAutoCreateProject"
              label="Автоматическое создание задачи на ответ"
            />
            <q-select
              v-model="form.target_project_id"
              :disable="!isAutoCreateProject"
              :options="projects"
              dense
              class="base-selector"
              popup-content-class="scrollable-content fit-popup"
              option-value="id"
              option-label="name"
              label="Проект"
              style="min-width: 200px"
            />
          </div>
          <div>
            <div class="q-mt-sm">Присылать уведомления о прохождении</div>
            <div :class="!$q.screen.lt.sm ? 'row no-wrap' : 'column'">
              <q-checkbox
                v-model="form.notification_channels.telegram"
                label="Telegram"
                class="q-mr-md"
              />
              <q-checkbox
                v-model="form.notification_channels.app"
                label="Система"
                class="q-mr-md"
              />
              <q-checkbox v-model="form.notification_channels.email" label="Email" />
            </div>
          </div>
          <EditorTipTapV2
            v-model="form.description"
            editor-id="form-editor-id"
            class="comments-editor q-mt-lg"
            editor-placeholder="Описание"
            disable-images
            :excluded-tabs="[TIPTAP_TABS.drawio]"
          />
        </q-card-section>
        <q-card-section class="column q-pa-none q-mt-lg">
          <q-list>
            <template v-for="(element, id) in form?.fields" :key="id">
              <AiFormItemBody
                v-model="form.fields[id]"
                @delete-question="deleteQuestion(id, form?.fields)"
                @upper="upper(id, form?.fields)"
                @lower="lower(id, form?.fields)"
                :number="id + 1"
                :show-arrow="form?.fields?.length > 1"
              />
            </template>
          </q-list>
          <AddQuestionTypeField
            @addField="(object) => addQuestion(object, form.fields)"
          />
        </q-card-section>
        <FormsButton
          :disable="
            !form.title ||
            (isAutoCreateProject && !(form?.target_project_id || false))
          "
          :isEdit="props.formSlug ? true : false"
          @close="dialogRef.hide()"
          @save="save()"
        />
        <q-inner-loading
          style="max-width: none; max-height: 100%; height: 100vh"
          color="primary"
          :showing="isLoading"
        >
          <DefaultLoader />
        </q-inner-loading>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { useFormStore } from 'stores/form-store';
import { useWorkspaceStore } from 'stores/workspace-store';

// utils
import { isEmpty } from 'src/utils/validation';

// component
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import AddQuestionTypeField from 'src/components/forms/components/AddQuestionTypeField.vue';
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
import FormsButton from '../components/formsButton.vue';
import FormsDate from '../components/formsDate.vue';
import { AiplanReqForm } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import AiFormItemBody from '../components/AiFormItemBody.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';

const props = defineProps<{
  formSlug?: string;
}>();

const emits = defineEmits<{
  'success-create': [];
}>();

const formStore = useFormStore();
const workspaceStore = useWorkspaceStore();

const dialogRef = ref();
const formRef = ref();
const formTitle = ref();

const form = ref<AiplanReqForm>();
const visible = ref('all');
const isAutoCreateProject = ref(false);
const projects = ref([]);
const isLoading = ref(false);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const clear = () => {
  form.value = {
    title: '',
    description: '',
    fields: [],
    auth_require: false,
    end_date: getDate(),
    target_project_id: '',
  };
  visible.value = 'all';
  isAutoCreateProject.value = false;
  form.value.notification_channels = {
    telegram: false,
    app: false,
    email: false,
  };
};

const save = async () => {
  formRef.value.validate().then(async (res: boolean) => {
    if (!res) {
      onError();
      return;
    }
    if (formTitle.value.hasError) return;
    isLoading.value = true;
    const requestBody = {
      title: form.value.title,
      description: form.value.description,
      end_date: form.value.end_date
        ? serializationDate(form.value.end_date, true)
        : null,
      auth_require: visible.value === 'authorize',
      fields: form.value.fields,
      target_project_id: isAutoCreateProject.value
        ? form.value.target_project_id.id
        : null,
      notification_channels: form.value.notification_channels,
    };

    try {
      if (props.formSlug) {
        await formStore.updateForm(
          currentWorkspaceSlug.value,
          props.formSlug,
          requestBody,
        );
      } else {
        await formStore.createForm(currentWorkspaceSlug.value, requestBody);
      }
      onSuccess();
    } catch (e) {
      isLoading.value = false;
    } finally {
      isLoading.value = false;
      dialogRef.value.hide();
      emits('success-create');
    }
  });
};

const validateDate = (val: string) => {
  const minD = validDate(val);
  return minD;
};

const refresh = async () => {
  clear();
  await workspaceStore
    .getWorkspaceProjects(currentWorkspaceSlug.value as string)
    .then((d) => {
      projects.value = d.filter(
        (project) => project?.current_user_membership?.role > 5,
      );
    });
};

const getForm = async () => {
  refresh();
  if (props.formSlug) {
    const { data } = await formStore.getSettingsForm(props.formSlug, true);
    form.value = validateFormWithSlug(data);
    form.value.target_project_id = projects.value.find(
      (el) => el.id === form.value.target_project_id,
    );
    visible.value = form.value.auth_require ? 'authorize' : 'all';
    isAutoCreateProject.value = form.value.target_project_id ? true : false;
  }
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
