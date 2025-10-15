<template>
  <q-drawer
    show-if-above
    side="right"
    class="issue-side-drawer q-ml-sm issue-panel-card hide-scrollbar"
    overlay
    :width="600"
  >
    <SingleIssueDrawer>
      <template #extend-buttons>
        <div class="row justify-end flex q-gutter-sm">
          <q-btn
            class="secondary-btn-only-icon"
            icon="open_in_full"
            @click="emits('open', issueData.id)"
          >
            <HintTooltip>Расширить</HintTooltip>
          </q-btn>
          <q-btn
            class="secondary-btn-only-icon"
            icon="close"
            @click="emits('update:modelValue', false)"
          >
            <HintTooltip>Закрыть</HintTooltip>
          </q-btn>
        </div>
      </template>
      <template #extend-header>
        <MainIssueInfo preview />
      </template>
      <template #extend-content>
        <SelectChildren
          :projectid="issueData.project"
          :issueid="issueData.id"
          :is-disabled="
            hasPermissionByIssue(issueData, project, 'add-sub-issue')
          "
        />
        <LinkedIssuesPanel />

        <SelectAttachments
          entityType="issue"
          :is-edit="
            hasPermissionByIssue(issueData, project, 'change-issue-secondary')
          "
          :delete-attachment-func="deleteAttachment"
          :get-attachment-func="getAttachmentsList"
          :upload-attachment-func="uploadAttachments"
          :download-all-func="downloadAllAttachments"
          :id="issueData.id"
        />

        <SingleIssueActivity />
      </template>
    </SingleIssueDrawer>
  </q-drawer>
</template>

<script setup lang="ts">
// core
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

// stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import SelectChildren from 'src/modules/single-issue/sub-issues/ui/SubIssuesPanel.vue';
import SelectAttachments from 'src/components/SelectAttachments.vue';
import SingleIssueDrawer from 'src/components/issue-panels/SingleIssueDrawer.vue';
import SingleIssueActivity from 'src/components/issue-panels/SingleIssueActivity.vue';
import LinkedIssuesPanel from '../../linked-issues/ui/LinkedIssuesPanel.vue';
import { FileAttUploadProgressFunc } from 'src/interfaces/files';
import MainIssueInfo from '../../main-issue-info/ui/MainIssueInfo.vue';

const emits = defineEmits<{
  refresh: [];
  open: [id: string];
  'update:modelValue': [value: boolean];
}>();

const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiplanStore = useAiplanStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByIssue } = useRolesStore();

// store to refs
const { currentProjectID, project } = storeToRefs(projectStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const getAttachmentsList = async () => {
  return await aiplanStore.issueAttachmentsList(
    currentProjectID.value,
    currentIssueID.value,
  );
};

const uploadAttachments = async (
  ev: object,
  onProgress?: FileAttUploadProgressFunc,
) => {
  await aiplanStore.issueAttachmentsUpload(ev, issueData.value.id, onProgress);
};

const deleteAttachment = async (attachmentId: string) => {
  await aiplanStore.issueAttachmentDelete(currentIssueID.value, attachmentId);
};

// заменить на сервис после обновления апи
const downloadAllAttachments = async () => {
  const { data, headers } = await useAiplanStore().api.get(
    ` /api/auth/workspaces/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${currentIssueID.value}/issue-attachments/all/`,
    {
      responseType: 'blob',
    },
  );
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);

  const contentDisposition = headers['content-disposition'];
  const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
  const fileName = fileNameMatch ? fileNameMatch[1] : 'archive.zip';
  return { url, fileName };
};
</script>
