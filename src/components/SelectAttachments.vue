<template>
  <q-card flat class="full-w q-px-sm">
    <div>
      <h6 class="flex items-center">
        Вложения
        <IssuesColorCountTitle
          :count="attachments.length"
          :badgeClass="'circle-badge-issue'"
        />
        <div v-if="uploader.activeCount.value > 0">
          <span class="text-caption"
            >Загружается {{ uploader.activeCount.value }} файл(а/ов)</span
          >

          <q-btn
            v-if="uploader.uploading.value"
            no-caps
            flat
            class="btn-sm q-ml-sm"
            color="primary"
            @click="uploader.cancelAll"
            >Отмена</q-btn
          >
        </div>

        <q-btn
          v-show="attachments.length || uploadsStates.length"
          class="btn-only-icon-sm q-ml-sm"
          icon="more_horiz"
          flat
        >
          <q-menu>
            <q-list separator>
              <q-item
                v-if="showDownloadAll"
                clickable
                v-close-popup
                @click.stop="handleDownload"
              >
                <q-item-section class="col-auto q-pr-sm">
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>Скачать все</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click.stop="openAttachmentsList">
                <q-item-section class="col-auto q-pr-sm">
                  <q-icon name="list" />
                </q-item-section>
                <q-item-section>Открыть как список</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </h6>
    </div>
    <q-btn
      v-if="isEdit === true"
      class="btn upload-btn full-w q-mt-md"
      no-caps
      @click="uploadInput?.click()"
      @drop.prevent="handleDrop"
      @dragenter.prevent="isDragIn = true"
      @dragover.prevent="isDragIn = true"
      @dragleave.prevent="isDragIn = false"
    >
      <div
        v-if="(!loading && !attachments.length) || attachments.length"
        class="flex items-center"
      >
        <LinkIcon color="var(--primary)" />
        <span> Нажмите или перетяните файл сюда </span>
      </div>
      <DefaultLoader v-if="loading && !attachments.length" />
    </q-btn>
    <input
      type="file"
      style="display: none"
      ref="uploadInput"
      multiple
      @change="handleDrop"
    />
    <div
      v-if="attachments.length || uploadsStates.length || loading"
      class="flex"
      style="height: fit-content; position: relative"
    >
      <div
        @scroll="updateScrollState"
        ref="scrollContainer"
        class="row scroll-attachments scrollable-content"
      >
        <div class="container-btn-scroll">
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(-300)"
            :style="!showLeftArrow ? `visibility: hidden;` : ``"
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_left" />
            </template>
          </q-btn>
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(300)"
            :style="!showRightArrow ? `visibility: hidden;` : ``"
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_right" />
            </template>
          </q-btn>
        </div>

        <div class="flex no-wrap">
          <template v-if="attachments.length || uploadsStates.length">
            <FileUploaderCard
              v-for="attachment in attachments"
              :key="attachment.id"
              :isEdit="isEdit"
              :file="attachment"
              class="inline-block"
              @copy-link="handleCopyLinkFile"
              @open="
                openDoc = true;
                file = attachment;
              "
              @delete="() => handleDeleteClick(attachment)"
            >
            </FileUploaderCard>
            <FileUploaderCard
              v-for="file of uploadsStates"
              :key="file.name"
              :isEdit="isEdit"
              :file="{
                asset: {
                  name: file.name,
                  size: file.size || 0,
                  content_type: '',
                  id: file.id || '',
                },
                created_at: new Date().toISOString(),
                id: file.id || '',
              }"
              class="inline-block"
              @cancel="cancelUpload(file.name)"
              @delete="
                (name) => {
                  handleDeleteClick({
                    asset: { name, id: file.id, size: file.size },
                    id: file.id,
                  });
                }
              "
              @retry="retryUpload(file.name)"
              :status="file.status"
              :progress="
                file.status === 'uploading' || file.status === 'pending'
                  ? file.progress
                  : null
              "
            >
            </FileUploaderCard>
          </template>
          <template v-else>
            <q-skeleton
              v-for="n in 3"
              :key="n"
              type="rect"
              class="q-mr-sm"
              width="180px"
              height="130px"
            />
          </template>
        </div>
      </div>
    </div>
    <AttachmentsInfo class="q-mt-sm" />
    <AttachmentsListDialog
      v-if="attachments.length || uploadsStates.length"
      v-model="isOpenAttachmentsList"
      :attachments="attachments"
      :loading="loading"
      :download-all-func="downloadAllFunc"
      @open="
        (val) => {
          openDoc = true;
          file = val;
        }
      "
      @delete="
        (attachment) => {
          handleDeleteClick(attachment);
        }
      "
    />
    <DocPreviewDialog v-model="openDoc" :file="file" />
    <DeleteAttachmentDialog
      v-model="showDeleteAttachmentDialog"
      :current-attachment="currentAttachmentDelete"
      @delete="handleDelete"
    />
  </q-card>
</template>

<script setup lang="ts">
//core
import { computed, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { copyToClipboard } from 'quasar';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

//components
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import DocPreviewDialog from './dialogs/DocPreviewDialog.vue';
import AttachmentsListDialog from './dialogs/AttachmentsListDialog.vue';
import DeleteAttachmentDialog from 'src/components/dialogs/DeleteAttachmentDialog.vue';
import IssuesColorCountTitle from './IssuesColorCountTitle.vue';
import FileUploaderCard from 'src/shared/components/file-uploader/FileUploaderCard.vue';

//utils
import { useHorizontalScroll } from 'src/composables/useHorizontalScroll';
import { setIntervalFunction } from 'src/utils/helpers';
import { IAttachmentCard } from 'src/interfaces/files';
import {
  extractFilesFromEvent,
  generateAttachmentShareLink,
} from 'src/utils/files';

//consts
import {
  CANCELLED_ADD_ATTACHMENT,
  ERROR_ADD_ATTACHMENT,
  SUCCESS_ADD_ATTACHMENT,
  SUCCESS_DELETE_ATTACHMENT,
  SUCCESS_DOWNLOAD_FILE,
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  ERROR_COPY_LINK_TO_CLIPBOARD,
} from 'src/constants/notifications';
import {
  MAX_SIZE_FILE,
  MAX_SIZE_FILE_VALUE,
  MAX_SIZE_FILE_UNIT,
} from 'src/constants/aidocFiles';

//types
import { useTusUploader } from 'src/composables/useTusUploader';
import AttachmentsInfo from './AttachmentsInfo.vue';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  id?: string;
  entityType: 'doc' | 'issue';
  isEdit?: boolean;
  deleteAttachmentFunc?: (value: string) => Promise<void>;
  getAttachmentFunc?: (projectID: Ref<string>, issueID: Ref<string>) => any; //getAttachmentFunc: () => Promise<void>;
  downloadAllFunc?: () => Promise<{ url: string; fileName: string }>;
  issueData?: DtoIssue;
  draftMode?: boolean;
}>();

const uploader = useTusUploader({
  type: 'tus',
  uploadUrl: '/api/auth/attachments/tus/',
  concurrency: 5,
  entityId: props.id,
  entityType: props.entityType,
  onNotify({ type, file, message }) {
    setNotificationView({
      open: true,
      type,
      customMessage: ` ${
        message ? message : `${file.name}: ${getCustomMessageOnNotify(type)}`
      } `,
    });
  },
});

//core
const route = useRoute();

//stores
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiDocStore = useAiDocStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { currentProjectID } = storeToRefs(projectStore);
const { currentIssueID, issueData } = storeToRefs(singleIssueStore);
const { selectedDocId } = storeToRefs(aiDocStore);

//variables
const file = ref();
const scrollContainer = ref<HTMLElement>();
const rows = ref<any[]>([]);
const loading = ref(false);
const openDoc = ref(false);
const isDragIn = ref(false);
const uploadInput = ref<HTMLInputElement>();
const currentAttachmentDelete = ref();
const isOpenAttachmentsList = ref<boolean>(false);
const showDeleteAttachmentDialog = ref<boolean>(false);

const abortController = new AbortController();

interface DraftAttachment {
  id: string; // uuid
  file: File;
  name: string;
  size: number;
  createdAt: string;
}

const draftFiles = ref<DraftAttachment[]>([]);

const attachments = computed(() => {
  if (props.draftMode) {
    return draftFiles.value.map((f) => ({
      id: f.id,
      asset: {
        name: f.name,
        size: f.size,
        id: f.id,
        content_type: f.file.type,
      },
      created_at: f.createdAt,
      draft: true,
      status: 'pending',
      progress: 0,
    }));
  }

  return rows.value;
});

//computeds
const uploadsStates = computed(() => uploader.uploadsState.value.map((e) => e));
const showDownloadAll = computed(
  () => !!props.downloadAllFunc && rows.value.length > 0,
);

//methods
const uploadDraftAttachments = async (entityId: string) => {
  if (!props.draftMode || !draftFiles.value.length) return;

  const uploader = useTusUploader({
    type: 'tus',
    uploadUrl: '/api/auth/attachments/tus/',
    concurrency: 5,
    entityId: entityId,
    entityType: props.entityType,
    onNotify({ type, file, message }) {
      setNotificationView({
        open: true,
        type,
        customMessage: ` ${
          message ? message : `${file.name}: ${getCustomMessageOnNotify(type)}`
        } `,
      });
    },
  });
  for (const draft of draftFiles.value) {
    uploader.enqueue(draft.file);
  }

  return uploader.waitAll();
};

const handleFiles = async (files: FileList) => {
  for (const file of Array.from(files)) {
    await uploader.enqueue(file);
  }
};

const cancelUpload = (fileName: string) => {
  uploader.cancel(fileName);
};

const deleteUpload = (fileName: string) => {
  uploader.deleteFile(fileName);
};

const retryUpload = async (fileName: string) => {
  uploader.retry(fileName);
  await uploader.waitAll();
  if (uploader.isAllUploaded.value) {
    await refresh();
  }
};

const resetUploadStates = () => {
  uploader.resetTusStates();
};

const {
  showLeftArrow,
  showRightArrow,
  scroll,
  updateScrollState,
  init: initScroll,
} = useHorizontalScroll(
  scrollContainer,
  computed(() => rows.value.length),
);

const getAttachments = async () => {
  if (props.draftMode) return;

  if (currentWorkspaceSlug.value && selectedDocId.value) {
    if (!props.getAttachmentFunc) return;
    rows.value = await props.getAttachmentFunc(
      currentWorkspaceSlug,
      selectedDocId,
    );
  } else if (
    (props.issueData?.project ?? currentProjectID.value) &&
    currentIssueID.value
  ) {
    if (!props.getAttachmentFunc) return;
    rows.value = await props.getAttachmentFunc(
      currentProjectID,
      currentIssueID,
    );
  } else {
    return;
  }
};

const openAttachmentsList = (): void => {
  isOpenAttachmentsList.value = true;
};

const refresh = async () => {
  try {
    loading.value = true;
    isDragIn.value = false;

    await getAttachments();
  } finally {
    loading.value = false;
    resetUploadStates();
  }
};

defineExpose({ refresh, uploadDraftAttachments });

const getCustomMessageOnNotify = (type: 'success' | 'error' | 'cancelled') => {
  switch (type) {
    case 'success':
      return SUCCESS_ADD_ATTACHMENT;
    case 'error':
      return ERROR_ADD_ATTACHMENT;
    case 'cancelled':
      return CANCELLED_ADD_ATTACHMENT;
  }
};

const handleFileList = (ev: Event) => {
  const { validFiles, errors } = extractFilesFromEvent(
    ev,
    MAX_SIZE_FILE,
    MAX_SIZE_FILE_VALUE,
    MAX_SIZE_FILE_UNIT,
  );

  if (errors.length) {
    errors.forEach((message) => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: message,
      });
    });
  }

  return validFiles;
};

const addFilesToDraft = (files: File[]) => {
  files.forEach((file) => {
    draftFiles.value.push({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
    });
  });
};

const deleteDraftFile = (id: string) => {
  draftFiles.value = draftFiles.value.filter((f) => f.id !== id);
};

const handleDrop = async (ev: Event) => {
  isDragIn.value = false;
  const validFiles = handleFileList(ev);

  if (!validFiles.length) return;

  if (props.draftMode) {
    addFilesToDraft(validFiles);
    return;
  }

  try {
    if (validFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));

      await handleFiles(dataTransfer.files);

      await uploader.waitAll();
    }
  } catch (error) {
    console.error('Error handling file drop:', error);
  } finally {
    if (!abortController.signal.aborted) {
      await refresh();
    }
  }

  if (uploadInput.value) uploadInput.value.value = '';
};

const handleDeleteClick = (value: any) => {
  if (props.draftMode) {
    deleteDraftFile(value.id);
    return;
  }
  currentAttachmentDelete.value = value;
  showDeleteAttachmentDialog.value = true;
};

const handleDelete = async () => {
  if (!currentAttachmentDelete.value.id) {
    deleteUpload(currentAttachmentDelete.value.asset.name);
    return;
  }
  try {
    if (!props.deleteAttachmentFunc) return;
    await props.deleteAttachmentFunc(currentAttachmentDelete.value.id);
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_DELETE_ATTACHMENT,
    });
  } catch (error) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: ERROR_ADD_ATTACHMENT,
    });
  } finally {
    await refresh();
  }
};

const handleDownload = async () => {
  try {
    loading.value = true;
    if (props.downloadAllFunc) {
      const { url, fileName } = await props.downloadAllFunc();
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_DOWNLOAD_FILE,
      });
    }
  } finally {
    loading.value = false;
  }
};

const handleCopyLinkFile = (file: IAttachmentCard) => {
  try {
    const link = generateAttachmentShareLink(
      window.location.origin,
      route.path.includes('aidoc') ? 'aidoc' : 'issue',
      route.params.workspace as string,
      route.path.includes('issue')
        ? `${issueData.value?.project_detail?.identifier}-${issueData.value?.sequence_id}`
        : (route.params.doc as string),
      file.asset?.name,
      file.asset.id,
    );
    copyToClipboard(link);
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_COPY_LINK_TO_CLIPBOARD,
    });
  } catch (e) {
    setNotificationView({
      type: 'error',
      open: true,
      customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
    });
  }
};

//hooks

const refreshCycle = ref();

onMounted(async () => {
  await refresh();
  initScroll();

  refreshCycle.value = setIntervalFunction(getAttachments);
});

onBeforeUnmount(() => {
  abortController.abort();
  clearInterval(refreshCycle.value);
});

watch(
  () => uploader.isAllUploaded.value,
  () => {
    if (uploader.isAllUploaded.value) {
      refresh();
    }
  },
);
</script>

<style lang="scss" scoped>
.drop-box:hover {
  background-color: $grey-2;
}

.isDragIn {
  outline: 1px dashed black;
  background-color: $grey-2;
}

:deep(.q-table__top, .q-table__middleq-px-sm) {
  display: none;
}

h6 {
  margin-bottom: 0 !important;
}

.scroll-attachments {
  display: flex;
  height: 155px;
  overflow-x: auto;
  flex-wrap: nowrap;
  align-items: center;
}

.container-btn-scroll {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  visibility: hidden;
  justify-content: space-between;

  .btn-scroll-attachments {
    margin: 0 8px;
  }
}

.attachments-title {
  font-weight: bold;
  font-size: 18px;
}
</style>
