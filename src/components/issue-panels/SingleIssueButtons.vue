<template>
  <div class="col">
    <div class="row q-pb-sm flex-center">
      <h6 class="col">
        {{ issueData.project_detail.identifier }}-{{ issueData.sequence_id }}
      </h6>
      <div class="row justify-end flex q-gutter-sm">
        <q-btn
          v-if="
            hasPermissionByIssue(issueData, project, 'change-issue-primary')
          "
          :class="
            issueData.draft ? 'orange-btn-only-icon' : 'secondary-btn-only-icon'
          "
          @click="switchDraft"
          icon="edit_note"
        >
          <HintTooltip>{{
            issueData.draft ? 'Опубликовать задачу' : 'Сделать черновиком'
          }}</HintTooltip>
        </q-btn>
        <q-btn
          v-if="
            hasPermissionByIssue(issueData, project, 'change-issue-primary')
          "
          class="secondary-btn-only-icon"
          icon="move_up"
          @click="() => (isTransferOpen = !isTransferOpen)"
        >
          <HintTooltip>Копировать/перенести</HintTooltip>
        </q-btn>

        <q-btn
          class="secondary-btn-only-icon"
          @click="singleIssueStore.issueLinkToClipboard()"
        >
          <LinkIcon color="var(--primary)" />
          <HintTooltip> Скопировать ссылку</HintTooltip>
        </q-btn>
        <q-btn
          v-if="isDev()"
          class="secondary-btn-only-icon"
          @click="downloadPDF"
        >
          <ExportPdfIcon color="var(--primary)" />
          <HintTooltip>Экспортировать в PDF</HintTooltip>
        </q-btn>
        <q-btn
          v-if="hasPermissionByIssue(issueData, project, 'delete-issue')"
          class="delete-btn-only-icon"
          no-caps
          @click="isDeletingOpen = true"
        >
          <HintTooltip>Удалить</HintTooltip>

          <BinIcon color="#fff"></BinIcon>
        </q-btn>
      </div>
    </div>
  </div>
  <TransferTaskDialog v-model="isTransferOpen" :issue="issueData" />
  <DeleteIssueDialog v-model="isDeletingOpen" :issue="issueData" />
</template>
<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

// components

import BinIcon from 'src/components/icons/BinIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DeleteIssueDialog from 'src/components/dialogs/IssueDialogs/DeleteIssueDialog.vue';
import TransferTaskDialog from 'src/components/dialogs/TransferTaskDialogs/TransferTaskDialog.vue';
import { useNotificationStore } from 'src/stores/notification-store';
import {
  SUCCESS_PUBLISH_ISSUE,
  SUCCESS_SAVE_DRAFT,
} from 'src/constants/notifications';
import ExportPdfIcon from '../icons/ExportPdfIcon.vue';

// emits
const emits = defineEmits<{ refresh: [] }>();

// stores
const { setNotificationView } = useNotificationStore();
const projectStore = useProjectStore();
const { hasPermissionByIssue } = useRolesStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const api = useAiplanStore();

// store to refs
const { workspaceInfo } = storeToRefs(workspaceStore);
const { currentProjectID, project } = storeToRefs(projectStore);
const { currentIssueID, issueData, issueExportPDFLink } =
  storeToRefs(singleIssueStore);

// vars
const isDeletingOpen = ref(false);
const isTransferOpen = ref(false);

const switchDraft = async () => {
  await api
    .issuePartialUpdate(
      workspaceInfo.value.slug,
      currentProjectID.value,
      currentIssueID.value,
      { draft: !issueData.value.draft },
    )
    .then(() => {
      issueData.value.draft = !issueData.value.draft;
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: !issueData.value.draft
          ? SUCCESS_PUBLISH_ISSUE
          : SUCCESS_SAVE_DRAFT,
      });
      emits('refresh');
    });
};

const downloadPDF = async () => {
  location.replace(issueExportPDFLink.value);
};

const isDev = () => {
  return (
    location.hostname == 'test.aiplan.aisa.ru' ||
    location.hostname === 'localhost'
  );
};
</script>
<style scoped lang="scss">
.edit-btn :deep(.q-icon) {
  font-size: 24px;
}
</style>
