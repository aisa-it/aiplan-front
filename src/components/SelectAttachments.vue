<template>
  <q-card flat class="full-w q-px-sm">
    <div>
      <h6 class="flex items-center">
        Вложения
        <IssuesColorCountTitle
          :count="rows.length"
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

        <q-btn class="btn-only-icon-sm q-ml-sm" icon="more_horiz" flat>
          <q-menu>
            <q-list separator>
              <q-item
                v-if="showDownloadAll"
                clickable
                v-close-popup
                @click="handleDownload"
              >
                <q-item-section class="col-auto q-pr-sm">
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>Скачать все</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="openAttachmentsList">
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
        v-if="(!loading && !rows.length) || rows.length"
        class="flex items-center"
      >
        <LinkIcon color="var(--primary)" />
        <span> Нажмите или перетяните файл сюда </span>
      </div>
      <DefaultLoader v-if="loading && !rows.length" />
    </q-btn>
    <input
      type="file"
      style="display: none"
      ref="uploadInput"
      multiple
      @change="handleDrop"
    />
    <div
      v-show="rows.length || uploadsStates.length"
      class="flex"
      style="height: fit-content; position: relative"
    >
      <div
        v-if="loading"
        class="flex w-full h-full items-center justify-center absolute"
        style="z-index: 2; width: 100%; padding-top: 8px; padding-bottom: 0"
      >
        <div
          class="flex w-full h-full items-center justify-center"
          style="
            width: 100%;
            height: 100%;
            border-radius: 8px;
            background-color: color-mix(
              in srgb,
              var(--primary-light) 70%,
              transparent
            );
          "
        >
          <DefaultLoader class="absolute" />
        </div>
      </div>
      <div
        @scroll="scrollManager?.updateBtnVisible()"
        ref="scrollContainer"
        class="row scroll-attachments scrollable-content"
      >
        <div class="container-btn-scroll">
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(-300)"
            :style="
              !scrollManager?.scrollState.showLeftArrow
                ? `visibility: hidden;`
                : ``
            "
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_left" />
            </template>
          </q-btn>
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(300)"
            :style="
              !scrollManager?.scrollState.showRightArrow
                ? `visibility: hidden;`
                : ``
            "
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_right" />
            </template>
          </q-btn>
        </div>

        <div class="flex no-wrap">
          <SelectAttachmentsCard
            v-for="row in rows"
            :key="row.id"
            :isEdit="isEdit"
            :row="row"
            class="inline-block"
            @delete="handleDeleteClick(row)"
            @open="
              () => {
                openDoc = true;
                file = row;
              }
            "
          />
          <SelectAttachmentsCard
            v-for="file of uploadsStates"
            :key="file.name"
            :isEdit="isEdit"
            :row="{
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
          />
        </div>
      </div>
    </div>
    <AttachmentsInfo class="q-mt-sm" />
    <AttachmentsListDialog
      v-model="isOpenAttachmentsList"
      :attachments="rows"
      :loading="loading"
      :download-all-func="downloadAllFunc"
      @open="
        (val) => {
          openDoc = true;
          file = val;
        }
      "
      @delete="
        (name) => {
          handleDeleteClick({
            asset: { name, id: file.id, size: file.size },
            id: file.id,
          });
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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watch,
} from 'vue';
import { storeToRefs } from 'pinia';
//stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';
//components
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import DocPreviewDialog from './dialogs/DocPreviewDialog.vue';
import AttachmentsListDialog from './dialogs/AttachmentsListDialog.vue';
import DeleteAttachmentDialog from 'src/components/dialogs/DeleteAttachmentDialog.vue';
import IssuesColorCountTitle from './IssuesColorCountTitle.vue';
import SelectAttachmentsCard from './SelectAttachmentsCard.vue';
//utils
import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';

import { setIntervalFunction } from 'src/utils/helpers';
//consts
import {
  CANCELLED_ADD_ATTACHMENT,
  ERROR_ADD_ATTACHMENT,
  SUCCESS_ADD_ATTACHMENT,
  SUCCESS_DELETE_ATTACHMENT,
  SUCCESS_DOWNLOAD_FILE,
} from 'src/constants/notifications';
import {
  MAX_SIZE_FILE,
  MAX_SIZE_FILE_VALUE,
  MAX_SIZE_FILE_UNIT,
} from 'src/constants/aidocFiles';
//types
import { useTusUploader } from 'src/composables/useTusUploader';
import AttachmentsInfo from './AttachmentsInfo.vue';

const props = defineProps<{
  id: string;
  entityType: 'doc' | 'issue';
  isEdit?: boolean;
  deleteAttachmentFunc: (value: string) => Promise<void>;
  getAttachmentFunc: (projectID: Ref<string>, issueID: Ref<string>) => any; //getAttachmentFunc: () => Promise<void>;
  downloadAllFunc?: () => Promise<{ url: string; fileName: string }>;
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

//stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentProjectID } = storeToRefs(projectStore);
const { currentIssueID } = storeToRefs(singleIssueStore);

//variables
const file = ref();
const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();
const rows = ref<any[]>([]);
const loading = ref(false);
const openDoc = ref(false);
const isDragIn = ref(false);
const uploadInput = ref<HTMLInputElement>();
const currentAttachmentDelete = ref();
const isOpenAttachmentsList = ref<boolean>(false);
const showDeleteAttachmentDialog = ref<boolean>(false);

const abortController = new AbortController();

//computeds
const uploadsStates = computed(() => uploader.uploadsState.value.map((e) => e));
const showDownloadAll = computed(
  () => !!props.downloadAllFunc && rows.value.length > 0,
);

//methods
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

const scroll = (direction: number) => {
  scrollManager.value?.scroll(direction);
};

const getAttachments = async () => {
  if (!currentProjectID.value || !currentIssueID.value) return;
  rows.value = await props.getAttachmentFunc(currentProjectID, currentIssueID);
  resetUploadStates();
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
  }
};

defineExpose({ refresh });

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
  let files: FileList | null = null;

  if ('dataTransfer' in ev && ev instanceof DragEvent) {
    files = ev.dataTransfer?.files || null;
  } else if (ev.target instanceof HTMLInputElement) {
    files = ev.target.files;
  }

  if (!files || files.length === 0) return [];

  const fileArray = Array.from(files);
  const validFiles = fileArray.filter((file) => file.size <= MAX_SIZE_FILE);
  const tooLargeFiles = fileArray.filter((file) => file.size > MAX_SIZE_FILE);

  if (tooLargeFiles.length) {
    tooLargeFiles.forEach((file) => {
      const message = `Данный файл превышает максимальный размер ${MAX_SIZE_FILE_VALUE}${MAX_SIZE_FILE_UNIT}: ${file.name}`;
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: message,
      });
    });
  }

  return validFiles;
};

const handleDrop = async (ev: Event) => {
  isDragIn.value = false;
  const validFiles = handleFileList(ev);
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
  currentAttachmentDelete.value = value;
  showDeleteAttachmentDialog.value = true;
};

const handleDelete = async () => {
  if (!currentAttachmentDelete.value.id) {
    deleteUpload(currentAttachmentDelete.value.asset.name);
    return;
  }
  try {
    await props.deleteAttachmentFunc(currentAttachmentDelete.value.id);
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_DELETE_ATTACHMENT,
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
//hooks

const refreshCycle = ref();

onMounted(async () => {
  await refresh();
  scrollManager.value = new ScrollManager(scrollContainer.value, false);
  scrollManager.value?.setResize();
  if (
    scrollManager.value?.scrollState.showLeftArrow ||
    scrollManager.value?.scrollState.showRightArrow
  ) {
    mouseWheelScrollHandler(scrollContainer.value, false);
  }

  refreshCycle.value = setIntervalFunction(getAttachments);
});

onBeforeUnmount(() => {
  if (scrollManager.value) {
    scrollManager.value.removeResize();
  }
  abortController.abort();

  clearInterval(refreshCycle.value);
});

watch(
  () => rows.value.length,
  () =>
    nextTick(() => {
      scrollManager.value?.updateBtnVisible();
      if (
        scrollManager.value?.scrollState.showLeftArrow ||
        scrollManager.value?.scrollState.showRightArrow
      ) {
        mouseWheelScrollHandler(scrollContainer.value, false);
      } else {
        scrollContainer.value.onwheel = null;
      }
    }),
);

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
