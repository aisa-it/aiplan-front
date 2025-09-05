<template>
  <div v-if="userImports?.length" class="import-list" style="">
    <div v-for="i in userImports" :key="i.id" class="jira-history-item q-mb-sm">
      <div v-if="i.finished === false" class="q-mb-sm">
        <div class="warning-text row no-wrap justify-between">
          <span style="width: 90%" class="row centered-horisontally">
            <span class="centered-horisontally q-mr-sm no-wrap">
              <WarningIcon class="q-mr-sm" />
              В ПРОЦЕССЕ С
            </span>
            <span v-if="i.start_at" class="q-mr-sm">
              {{ formatDateTime(i.start_at) }}
            </span>
            <span> {{ i.global_progress }}% </span>
          </span>
          <q-btn
            v-if="i.id"
            flat
            dense
            size="24px"
            padding="xs"
            color="red"
            @click="handleStopImport(i.id)"
          >
            <HintTooltip>Остановить импорт</HintTooltip>
            <CloseIcon color="#dc3e3e"></CloseIcon>
          </q-btn>
        </div>
        <span v-if="!i.finished && i.stage" class="sub-title">
          Стадия: {{ defineStage(i.stage) }}
        </span>
        <q-linear-progress
          v-if="i.progress"
          dark
          size="10px"
          :value="i.progress / 100"
          color="warning"
        />
        <span class="sub-title">Общий прогресс</span>
        <q-linear-progress
          v-if="i.global_progress"
          dark
          size="10px"
          :value="i.global_progress / 100"
          color="warning"
        />
      </div>

      <div v-if="i.finished === true && !i.error" class="q-mb-sm">
        <div class="row success-text">
          <span class="centered-horisontally q-mr-sm no-wrap">
            <SuccessIcon class="q-mr-xs" />
            ВЫПОЛНЕНО
          </span>
          <span v-if="i.end_at" class="q-mr-sm">
            {{ formatDateTime(i.end_at) }}
          </span>
          <span> {{ ' ' + i.progress }}% </span>
        </div>
      </div>

      <div v-if="i.finished === true && i.error" class="q-mb-sm">
        <div class="row danger-text">
          <span class="centered-horisontally q-mr-sm no-wrap">
            <AlertIcon :color="'#dc3e3e'" class="q-mr-xs" />
            ОШИБКА
          </span>
          <span class="centered-horisontally q-mr-sm">
            "{{ i.error }}"
            <span v-if="i.end_at">{{ ' ' + formatDateTime(i.end_at) }}</span>
            {{ ' ' + i.progress }}%
          </span>
        </div>
      </div>

      <div class="column">
        <span class="sub-title">Название проекта</span>
        <span>{{ i.project_key }}</span>
      </div>
      <div class="column">
        <span class="sub-title">Название пространства</span>
        <span v-if="i.target_workspace_id">{{
          setWorkspaceName(i.target_workspace_id)
        }}</span>
      </div>

      <span v-if="i.end_at" class="sub-title">
        Время импорта:
        {{
          msToRussianTime(
            dayjs(i.end_at).diff(dayjs(i.start_at), 'millisecond'),
          )
        }}
      </span>
      <div
        class="row centered-horisontally no-wrap justify-between"
        style="gap: 12px"
      >
        <div class="row sub-title">
          <span class="q-mr-sm" v-if="i.done_issues">
            Задачи {{ numberFormat(i.done_issues) }} из
            <span v-if="i.total_issues">
              {{ numberFormat(i.total_issues) }}</span
            >
          </span>
          <span v-if="i.imported_attachments">
            Вложения {{ numberFormat(i.imported_attachments) }} из
            <span v-if="i.total_attachments">
              {{ numberFormat(i.total_attachments) }}
            </span>
          </span>
        </div>
        <div>
          <q-btn
            v-if="i?.failed_attachments?.length"
            class="btn-only-icon-sm"
            style="border-color: #dc3e3e"
            @click="openFailed(i.failed_attachments)"
          >
            <ClipIcon color="#dc3e3e" :height="16" :width="16" />
            <HintTooltip>Ошибка переноса вложений</HintTooltip>
          </q-btn>
        </div>
      </div>
    </div>
    <ImportFailedAttachmentsDialog
      v-model="isFailedAttachmentsOpen"
      :attachments="failedAttachments"
    />
  </div>
</template>

<script lang="ts" setup>
// core
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// utils
import { numberFormat } from 'src/utils/format';
import { formatDateTime } from 'src/utils/time';
import { msToRussianTime } from 'src/utils/time';
// icons
import ClipIcon from 'src/components/icons/ClipIcon.vue';
import AlertIcon from 'src/components/icons/AlertIcon.vue';
import SuccessIcon from 'src/components/icons/import/SuccessIcon.vue';
import WarningIcon from 'src/components/icons/import/WarningIcon.vue';
// interfaces
import { IssuesImportFailedAttachment } from '@aisa-it/aiplan-api-ts/src/data-contracts';
// constants
import { defineStage } from 'src/constants/jiraConstants';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
//components
import ImportFailedAttachmentsDialog from '../import-finish/import-failed-attachements-dialog/ImportFailedAttachmentsDialog.vue';

// store
const userStore = useUserStore();
const importStore = useImportStore();

// store to refs
const { userImports } = storeToRefs(importStore);
const { userWorkspaces } = storeToRefs(userStore);

// vars
const failedAttachments = ref([]) as Ref<Array<IssuesImportFailedAttachment>>;
const isFailedAttachmentsOpen = ref(false);

// function
const setWorkspaceName = (value: string) => {
  return userWorkspaces.value.find((ws) => ws.id === value)?.name || '';
};

const openFailed = (fAttachments: Array<IssuesImportFailedAttachment>) => {
  failedAttachments.value = fAttachments;
  isFailedAttachmentsOpen.value = true;
};

const handleStopImport = (importId: string) => {
  importStore.stopImport(importId);
};
</script>

<style lang="scss" scoped>
.import-list {
  width: 100%;
  max-height: 360px;
  overflow: auto;
  @media screen and (max-width: 1010px) {
    max-height: 220px;
  }
}
</style>
