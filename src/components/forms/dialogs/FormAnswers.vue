<template>
  <q-dialog
    v-bind="$attrs"
    no-refocus
    @show="getInfo()"
    @hide="() => resetDialog()"
  >
    <q-card class="fullscreen-dialog">
      <q-card-section v-if="!loading" class="q-pa-lg">
        <h6 class="form-header">{{ headContent }}</h6>
        <div
          class="flex items-center form-author q-mt-sm"
          style="margin-bottom: 32px"
        >
          <AvatarImage
            v-if="answer.responder"
            :key="answer.responder?.id"
            :tooltip="aiplan.UserName(answer?.responder).join(' ')"
            :text="
              [
                aiplan.UserName(answer?.responder)[0]?.at(0),
                aiplan.UserName(answer?.responder)[1]?.at(0),
              ].join(' ')
            "
            :image="answer.responder?.avatar_id"
            :member="answer?.responder"
            :show-avatar-popup="true"
            is-show-popup-middle
            @click.stop
          ></AvatarImage>
          <span v-if="answer.responder" class="q-ml-md q-mr-xs body-text-md">{{
            aiplan.UserName(answer?.responder).join(' ')
          }}</span>
          <span>{{ formatDateTime(form.created_at) }}</span>
        </div>
        <div class="flex flex-col gap-lg body-1">
          <div
            v-for="(a, index) in answer?.fields"
            :key="index"
            class="form-answers"
          >
            <p class="form-answers_title">
              {{ Number(index) + 1 + '. ' + a.label }}
            </p>
            <p v-if="a?.type === 'checkbox'">
              {{ a.value === true ? 'Да' : 'Нет' }}
            </p>
            <q-input
              v-if="a?.type === 'textarea'"
              type="textarea"
              :model-value="a.value ? a.value : 'Нет ответа'"
              class="readonly-textarea"
              readonly
              autogrow
            >
            </q-input>
            <p
              v-else-if="
                a?.type === 'input' ||
                a?.type === 'numeric' ||
                a?.type === 'select'
              "
              style="white-space: pre-wrap"
            >
              {{ a.value ? a.value : 'Нет ответа' }}
            </p>
            <div v-else-if="a?.type === 'multiselect'">
              <div v-for="(b, id) in a.value" :key="id">{{ b }}</div>
              <p v-if="!a.value?.length">Нет ответа</p>
            </div>
            <p class="flex items-center" v-else-if="a?.type === 'color'">
              <q-badge
                v-if="a.value"
                rounded
                :style="{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  backgroundColor: a.value,
                }"
              />
              {{ a.value ? a.value : 'Нет ответа' }}
            </p>
            <p v-else-if="a?.type === 'date'">
              {{ a.value ? formatDate(a.value) : 'Нет ответа' }}
            </p>
            <div v-else-if="a?.type === 'attachment'">
              <div v-if="a.value" class="row q-col-gutter-sm">
                <FileUploaderCard
                  v-if="getAttachment(a.value)"
                  :file="getAttachment(a.value)"
                  :is-edit="false"
                  @open="openPreview(getAttachment(a.value))"
                  @download="downloadFile(getAttachment(a.value))"
                  @copy-link="handleCopyLink(getAttachment(a.value))"
                />
              </div>
            </div>
            <p v-else>Нет ответа</p>
          </div>
        </div>
      </q-card-section>
      <div v-else class="loader-wrapper">
        <DefaultLoader />
      </div>
    </q-card>
  </q-dialog>

  <DocPreviewDialog v-model="isPreviewOpen" :file="previewFile" />
</template>

<script setup lang="ts">
//core
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { copyToClipboard } from 'quasar';

//stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useFormStore } from 'src/stores/form-store';
import { useNotificationStore } from 'src/stores/notification-store';

//utils
import aiplan from 'src/utils/aiplan';
import { formatDate, formatDateTime } from 'src/utils/time';

//api
import { getAnswer, getFormAuth } from 'src/components/forms/services/api';

//components
import AvatarImage from 'src/components/AvatarImage.vue';
import FileUploaderCard from 'src/shared/components/file-uploader/FileUploaderCard.vue';
import DocPreviewDialog from 'src/components/dialogs/DocPreviewDialog.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import {
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  ERROR_COPY_LINK_TO_CLIPBOARD,
} from 'src/constants/notifications';

const props = defineProps<{
  answerId: number;
  formSlug: string;
}>();

//stores
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//state
const form = ref();
const answer = ref();
const loading = ref(true);
const previewFile = ref<any>(null);
const isPreviewOpen = ref(false);

//computeds
const headContent = computed(() => {
  const content = `Ответы на форму "${form.value?.title}" от `;
  const user = !answer.value?.responder
    ? 'анонимного пользователя'
    : `пользователя @${answer.value?.responder?.username}`;

  return content + user;
});

//methods
const getCurrentAnswer = async () => {
  if (!currentWorkspaceSlug.value) return;

  const data = await getAnswer(
    currentWorkspaceSlug.value,
    props.formSlug,
    String(props.answerId),
  );
  answer.value = data;
};

const getCurrentForm = async () => {
  const storedForm = useFormStore().getFormBySlug(props.formSlug);
  if (storedForm) form.value = storedForm;
  else form.value = await getFormAuth(props.formSlug);
};

const getInfo = async () => {
  loading.value = true;
  await getCurrentAnswer();
  await getCurrentForm();
  loading.value = false;
};

const resetDialog = () => {
  loading.value = true;
};

const getAttachment = (id: string) => {
  if (!answer.value?.attachments) return null;

  return answer.value.attachments.find((a: any) => a.id === id);
};

const openPreview = (file: any) => {
  previewFile.value = file;
  isPreviewOpen.value = true;
};

const downloadFile = (file: any) => {
  if (!file?.asset?.id) return;
  const url = `/api/auth/file/${file.asset.id}`;
  const link = document.createElement('a');
  link.href = url;
  if (file.asset.name) {
    link.setAttribute('download', file.asset.name);
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleCopyLink = (file: any) => {
  if (!file?.asset?.id) return;
  const url = `${window.location.origin}/api/auth/file/${file.asset.id}`;

  copyToClipboard(url)
    .then(() => {
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_COPY_LINK_TO_CLIPBOARD,
      });
    })
    .catch(() => {
      setNotificationView({
        type: 'error',
        open: true,
        customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
      });
    });
};
</script>

<style lang="scss" scoped>
.form {
  &-header {
    font-size: 20px;
    letter-spacing: 0.15px;
    color: $text-color;
    margin: 0 !important;
  }
  &-author {
    font-size: 16px;
    letter-spacing: 0.5px;
    color: $sub-text-color;
  }
  &-answers {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &_title {
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0 !important;
    }
  }
}

.loader-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
:deep(.q-field--standard .q-field__control:before) {
  border-bottom: 0px !important;
}

:deep(.q-field__control-container) {
  textarea {
    font-size: 16px;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.5px;
  }
}
</style>
