<template>
  <div class="file-grid q-px-sm q-pt-sm">
    <q-card :key="file.id" class="file-card" flat dense>
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
              getIconFormat(getFileExtension(file, 'extension')) || FileNoneIcon
            "
            :width="42"
            :height="42"
          />

          <div class="file-actions">
            <slot
              name="actions"
              :row="file"
              :is-edit="isEdit"
              :status="status"
              :progress="progress"
            >
              <q-btn
                v-if="!progress && !status && !file.draft"
                unelevated
                dense
                @click="$emit('download', file)"
                class="buttons-attachments"
              >
                <LoadIcon :width="20" :height="20" />
                <HintTooltip>Скачать</HintTooltip>
              </q-btn>

              <q-btn
                v-if="!progress && !status && isPossibleToOpen(file)"
                unelevated
                dense
                @click="$emit('open')"
                class="buttons-attachments"
                :style="
                  !isPossibleToOpen(file) ? 'visibility: hidden;' : undefined
                "
              >
                <ZoomIcon :width="20" :height="20" />
                <HintTooltip>Предпросмотр</HintTooltip>
              </q-btn>

              <q-btn
                v-if="!progress && isEdit"
                padding="4px 4px"
                flat
                dense
                @click="$emit('delete', file.asset.name, file.id)"
                class="buttons-attachments"
              >
                <BinIcon color="#DC3E3E" :width="20" :height="20" />
                <HintTooltip>Удалить</HintTooltip>
              </q-btn>
            </slot>
          </div>
        </div>
        <div class="file-info">
          <div class="file-info-block">
            <div class="file-name ellipsis">
              {{ getFileExtension(file, 'name') }}
              <HintTooltip>
                {{ getFileExtension(file, 'name') }}
              </HintTooltip>
            </div>
            <div
              class="font-semibold q-ml-md"
              style="font-size: 12px; white-space: nowrap"
            >
              {{ getFileSize(file.asset.size) }}
            </div>
          </div>
          <div class="file-info-block file-date">
            <span class="abbriviated-text">{{
              formatDate(file.created_at)
            }}</span>
            <span style="font-weight: 800">{{
              '.' + getFileExtension(file, 'extension')
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
//core
import { ref } from 'vue';

//icons
import ZoomIcon from 'components/icons/ZoomIcon.vue';
import LoadIcon from 'src/components/icons/LoadIcon.vue';
import FileNoneIcon from 'src/components/icons/FileNoneIcon.vue';
import { getIconFormat } from 'src/utils/attachmentsIcons';
import CheckIcon from 'src/components/icons/CheckIcon.vue';
import ProgressUploadIcon from 'src/components/icons/ProgressUploadIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import HintTooltip from 'src/components/HintTooltip.vue';

//utils
import { getFileExtension, getFileSize } from 'src/utils/files';

//types
import { IAttachmentCard } from 'src/interfaces/files';

//components
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';

interface IProps {
  file: IAttachmentCard;
  isEdit?: boolean;
  progress?: number | null | undefined;
  status?: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  downloadProgress?: number;
}

const props = defineProps<IProps>();

defineEmits<{
  (e: 'delete', fileName: string, id: string): void;
  (e: 'open'): void;
  (e: 'download', row: IAttachmentCard): void;
}>();

const iconColor = ref('');

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
  const legacyFormats = [
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
  return legacyFormats.includes(extension);
};

const getFileName = (value: IAttachmentCard): string => {
  return value.asset.name;
};

function formatDate(inputDate: string) {
  if (!inputDate) return '';
  const dateParts = inputDate.split('T');
  if (dateParts.length < 2) return inputDate;
  const date = dateParts[0].split('-');
  const time = dateParts[1].split(':');

  return `${date[2]}.${date[1]}.${date[0]}, ${time[0]}:${time[1]}`;
}
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

.file-card {
  width: 200px;
}
</style>
