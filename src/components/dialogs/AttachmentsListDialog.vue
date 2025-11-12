<template>
  <q-dialog>
    <q-card class="attachments-list">
      <h6 class="attachments-list__heading">Вложения</h6>
      <q-separator />

      <q-table
        v-if="props.attachments.length"
        :rows="props.attachments"
        :columns="columns"
        :rows-per-page-options="
          !$q.screen.lt.sm ? [10, 15, 20, 25, 50, 0] : [5, 10, 15, 0]
        "
        class="attachments-list__table"
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div class="attachments-list__column row items-center no-wrap">
              <component
                :is="
                  getIconFormat(getFileExtension(props.row, 'extension')) ||
                  FileNoneIcon
                "
                :width="20"
                :height="20"
                class="q-mr-sm attachments-list__icon"
              />
              <span class="ellipsis">{{
                props.row.asset.name.slice(
                  0,
                  props.row.asset.name.lastIndexOf('.'),
                )
              }}</span>
              <HintTooltip>{{
                props.row.asset.name.slice(
                  0,
                  props.row.asset.name.lastIndexOf('.'),
                )
              }}</HintTooltip>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props"
            >{{
              props.row.asset.content_type
                ? props.row.asset.content_type
                : getFileExtension(props.row, 'extension')
            }}
          </q-td>
        </template>

        <template v-slot:body-cell-size="props">
          <q-td :props="props"
            >{{ formatFileSize(props.row.asset.size) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div
              v-if="!$q.screen.lt.md"
              class="q-gutter-xs justify-end"
            >
              <q-btn
                flat
                dense
                size="sm"
                class="rounded-btn"
                @click="handleCopyLink(props.row)"
              >
                <LinkIcon :width="20" :height="20" />
                <HintTooltip>Скопировать ссылку</HintTooltip>
              </q-btn>
              <q-btn
                unelevated
                dense
                size="sm"
                class="rounded-btn"
                @click="handleDownload(props.row)"
              >
                <LoadIcon :width="20" :height="20" />
                <HintTooltip>Скачать</HintTooltip>
              </q-btn>
              <q-btn
                unelevated
                dense
                size="sm"
                class="rounded-btn"
                @click="emit('open', props.row)"
              >
                <ZoomIcon :width="20" :height="20" />
                <HintTooltip>Предпросмотр</HintTooltip>
              </q-btn>
              <q-btn
                flat
                dense
                size="sm"
                class="rounded-btn"
                @click="emit('delete', props.row)"
              >
                <BinIcon :width="20" :height="20" color="#DC3E3E" />
                <HintTooltip>Удалить</HintTooltip>
              </q-btn>
            </div>
            <q-btn v-else flat dense size="sm" icon="more_vert" class="q-ml-xs">
              <q-menu auto-close>
                <q-list separator>
                  <q-item
                    clickable
                    v-close-popup
                    @click="handleCopyLink(props.row)"
                  >
                    <q-item-section class="col-auto q-pr-sm">
                      <LinkIcon :width="20" :height="20" />
                    </q-item-section>
                    <q-item-section>Скопировать ссылку</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="handleDownload(props.row)"
                  >
                    <q-item-section class="col-auto q-pr-sm">
                      <LoadIcon :width="20" :height="20" />
                    </q-item-section>
                    <q-item-section>Скачать</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="emit('open', props.row)"
                  >
                    <q-item-section class="col-auto q-pr-sm">
                      <ZoomIcon :width="20" :height="20" />
                    </q-item-section>
                    <q-item-section>Предпросмотр</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="emit('delete', props.row)"
                  >
                    <q-item-section class="col-auto q-pr-sm">
                      <BinIcon :width="20" :height="20" color="#DC3E3E" />
                    </q-item-section>
                    <q-item-section>Удалить</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <q-card-section v-else class="text-center text-grey">
        Нет вложений
      </q-card-section>

      <q-card-actions align="center" class="q-py-md">
        <q-btn
          v-if="props.downloadAllFunc && props.attachments.length > 0"
          :loading="loading"
          unelevated
          flat
          dense
          no-caps
          icon="download"
          label="Скачать все"
          color="primary"
          class="full-width primary-btn-sm"
          @click="handleDownloadAll"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar, copyToClipboard, QTableProps } from 'quasar';
import { useRoute } from 'vue-router';

import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useNotificationStore } from 'src/stores/notification-store';

import LinkIcon from '../icons/LinkIcon.vue';
import LoadIcon from '../icons/LoadIcon.vue';
import ZoomIcon from '../icons/ZoomIcon.vue';
import BinIcon from '../icons/BinIcon.vue';
import FileNoneIcon from '../icons/FileNoneIcon.vue';

import { IAttachmentCard } from 'src/interfaces/files';
import {
  ERROR_COPY_LINK_TO_CLIPBOARD,
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  SUCCESS_DOWNLOAD_FILE,
} from 'src/constants/notifications';

import { getIconFormat } from 'src/utils/attachmentsIcons';
import { getFileExtension } from 'src/utils/files';

const props = defineProps<{
  attachments: IAttachmentCard[];
  loading: boolean;
  downloadAllFunc?: () => Promise<{ url: string; fileName: string }>;
}>();

const emit = defineEmits<{
  open: [value: IAttachmentCard];
  delete: [value: IAttachmentCard];
}>();

const $q = useQuasar();
const route = useRoute();
const { issueData } = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
const api = useAiplanStore();
const downloadProgress = ref<number>(0);

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    label: 'Имя',
    field: (row) => row.asset.name,
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: 'Тип',
    field: (row) =>
      row.asset.content_type || getFileExtension(row, 'extension'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'size',
    label: 'Размер',
    field: (row) => row.asset.size,
    align: 'right',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Действия',
    field: '',
    align: 'center',
  },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const handleCopyLink = (file: IAttachmentCard): void => {
  try {
    const base = `${window.location.origin}/uploads/${file.asset.id}`;
    const type = route.path.includes('aidoc') ? 'aidoc' : 'issue';
    const slug = route.params.workspace;
    const from =
      type === 'issue'
        ? `${issueData.project_detail?.identifier}-${issueData?.sequence_id}`
        : route.params.doc;
    const name = file?.asset?.name;
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

const handleDownload = async (file: IAttachmentCard): Promise<void> => {
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

const handleDownloadAll = async (): Promise<void> => {
  if (props.downloadAllFunc && !props.loading) {
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
};
</script>

<style scoped lang="scss">
.attachments-list {
  min-width: 360px;
  max-width: 40%;
  width: 100%;
  max-height: 90vh;
  border-radius: 16px;

  &::-webkit-scrollbar {
    display: block;
  }

  &__heading {
    padding: 0 16px;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__column {
    width: 190px;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    border-bottom: 0.5px solid var(--darkest-border-color);
  }

  &__item-name {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

@media screen and (width < 600px) {
  .attachments-list {
    min-width: auto;
    max-width: 100%;

    &__column {
      max-width: 150px;
    }
  }

  :deep(.q-table__control) {
    width: 100%;
    justify-content: center;
  }
}
</style>
