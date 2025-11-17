<template>
  <div class="file-grid q-px-sm q-pt-sm">
    <q-card :key="row.id" class="file-card" flat dense>
      <q-card-section class="no-padding">
        <div class="file-icon-container">
          <div
            v-if="progress || status"
            class="flex justify-center align-center items-center relative w-full h-full"
          >
            <div v-if="progress" class="absolute">
              <DefaultLoader />
            </div>
            <q-btn
              padding="2px 2px"
              unelevated
              round
              dense
              :style="{
                'background-color': getStatusColor(),
                color: 'var(--buttons-attachments-icons-color)',
              }"
            >
              <component
                :is="getStatusIcon()"
                style="color: var(--buttons-attachments-icons-color)"
                :width="42"
                :height="42"
              />
            </q-btn>
            <div>{{ iconColor }}</div>
          </div>
          <component
            v-if="!progress && !status"
            :is="
              getIconFormat(getFileExtension(row, 'extension')) || FileNoneIcon
            "
            :width="42"
            :height="42"
          />

          <div class="file-actions">
            <q-btn
              v-if="!status && !progress"
              flat
              dense
              @click="handleCopyLink(row)"
              class="buttons-attachments"
            >
              <LinkIcon :width="20" :height="20" />
              <HintTooltip>Скопировать ссылку</HintTooltip>
            </q-btn>
            <q-btn
              v-if="progress"
              padding="2px 2px"
              flat
              round
              dense
              @click="handleCancel"
              class="buttons-attachments"
            >
              <CloseIcon :width="35" :height="35" />
            </q-btn>
            <q-btn
              v-if="!progress && !status"
              unelevated
              dense
              @click="handleDownload(row)"
              class="buttons-attachments"
            >
              <LoadIcon :width="20" :height="20" />
              <HintTooltip>Скачать</HintTooltip>
            </q-btn>
            <q-btn
              v-if="(!progress && status === 'error') || status === 'cancelled'"
              unelevated
              dense
              @click="handleRetry"
              class="buttons-attachments"
            >
              <RefreshIcon :width="20" :height="20" />
              <HintTooltip>Повторить загрузку</HintTooltip>
            </q-btn>
            <q-btn
              v-if="!progress && !status && isPossibleToOpen(row)"
              unelevated
              dense
              @click="handleOpen"
              class="buttons-attachments"
              :style="
                !isPossibleToOpen(row) ? 'visibility: hidden;' : undefined
              "
            >
              <ZoomIcon :width="20" :height="20" />
              <HintTooltip>Предпросмотр</HintTooltip>
            </q-btn>
            <q-btn
              v-if="!progress"
              :disable="!isEdit"
              padding="4px 4px"
              flat
              dense
              @click="handleDelete(row.asset.name, row.id)"
              class="buttons-attachments"
            >
              <BinIcon color="#DC3E3E" :width="20" :height="20" />
              <HintTooltip>Удалить</HintTooltip>
            </q-btn>
          </div>
        </div>
        <div class="file-info">
          <div class="file-info-block">
            <div class="file-name ellipsis">
              {{ getFileExtension(row, 'name') }}
              <HintTooltip>
                {{ getFileExtension(row, 'name') }}
              </HintTooltip>
            </div>
            <div
              class="font-semibold q-ml-md"
              style="font-size: 12px; white-space: nowrap"
            >
              {{ getFileSize(row.asset.size) }}
            </div>
          </div>
          <div class="file-info-block file-date">
            <span class="abbriviated-text">{{
              formatDate(row.created_at)
            }}</span>
            <span style="font-weight: 800">{{
              '.' + getFileExtension(row, 'extension')
            }}</span>
          </div>
          <q-linear-progress
            v-if="downloadProgress"
            size="sm"
            animationSpeed="200"
            :value="downloadProgress / 100"
            color="primary"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';

import ZoomIcon from 'components/icons/ZoomIcon.vue';
import LoadIcon from 'src/components/icons/LoadIcon.vue';
import FileNoneIcon from './icons/FileNoneIcon.vue';
import { getIconFormat } from 'src/utils/attachmentsIcons';

import {
  SUCCESS_DOWNLOAD_FILE,
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  ERROR_COPY_LINK_TO_CLIPBOARD,
} from 'src/constants/notifications';
import { getFileExtension, getFileSize } from 'src/utils/files';
import { IAttachmentCard } from 'src/interfaces/files';
import DefaultLoader from './loaders/DefaultLoader.vue';
import CheckIcon from './icons/CheckIcon.vue';
import RefreshIcon from './icons/RefreshIcon.vue';
import ProgressUploadIcon from './icons/ProgressUploadIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';
import BinIcon from './icons/BinIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
import { copyToClipboard } from 'quasar';
import { useRoute } from 'vue-router';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

interface IProps {
  row: IAttachmentCard;
  isEdit?: boolean;
  progress?: number | null | undefined;
  status?: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
}

const props = defineProps<IProps>();

const emits = defineEmits<{
  delete: [fileName: string, id: string];
  open: [];
  cancel: [];
  retry: [];
}>();

const route = useRoute();

const api = useAiplanStore();
const { issueData } = useSingleIssueStore();

const { setNotificationView } = useNotificationStore();

const iconColor = ref('');

const downloadProgress = ref(0);

const getStatusIcon = () => {
  switch (props.status) {
    case 'pending':
      return ProgressUploadIcon;
    case 'success':
      return CheckIcon;
    case 'cancelled':
      return CloseIcon;
    case 'error':
      return CloseIcon;
    default:
      return FileNoneIcon;
  }
};

const getStatusColor = () => {
  switch (props.status) {
    case 'pending':
      return '#BAC4D5';
    case 'success':
      return '#21ba45';
    case 'cancelled':
      return '#BAC4D5';
    case 'error':
      return '#dc3e3e';
    default:
      return '';
  }
};

const isPossibleToOpen = (value: IAttachmentCard) => {
  if (props.progress) return false;
  let extension = getFileName(value).split('.').pop()?.toLowerCase() ?? '';
  const supportedFormats = [
    'pdf',
    'png',
    'jpeg',
    'jpg',
    'mp4',
    'mov',
    'wmv',
    'webm',
    'mkv',
    'gif',
    'wav',
    'aiff',
    'ape',
    'flac',
    'mp3',
    'ogg',
  ];
  return supportedFormats.includes(extension);
};

const handleDownload = async (file: IAttachmentCard) => {
  try {
    const { data } = await api.api.get(`/api/file/${file.asset.id}`, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        downloadProgress.value = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1),
        );
      },
    });
    const blob = new Blob([data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.asset.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_DOWNLOAD_FILE,
    });
  } finally {
    downloadProgress.value = 0;
  }
};

const getFileName = (value: IAttachmentCard): string => {
  return value.asset.name;
};

function formatDate(inputDate: string) {
  if (!inputDate) return '';
  const dateParts = inputDate.split('T');
  const date = dateParts[0].split('-');
  const time = dateParts[1].split(':');

  return `${date[2]}.${date[1]}.${date[0]}, ${time[0]}:${time[1]}`;
}

const handleOpen = () => {
  emits('open');
};
const handleDelete = (fileName: string, id: string) => {
  emits('delete', fileName, id);
};

const handleCancel = () => {
  emits('cancel');
};

const handleRetry = () => {
  emits('retry');
};
const handleCopyLink = (file: IAttachmentCard) => {
  try {
    const base = `${window.location.origin}/api/file/${file.asset.id}`;
    const type = route.path.includes('aidoc') ? 'aidoc' : 'issue';
    const slug = route.params.workspace;
    const from =
      type === 'issue'
        ? `${issueData.project_detail?.identifier}-${issueData?.sequence_id}`
        : route.params.doc;
    const name = props.row?.asset?.name;
    const query = `?slug=${slug}&type=${type}&from=${from}&name=${name}`;
    const link = base + query;
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
</script>

<style lang="scss" scoped>
.file-info-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-actions {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0s 0.3s;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 198px;
  height: 90px;
  gap: 5px;
}

.file-icon-container {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ellipsis {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
