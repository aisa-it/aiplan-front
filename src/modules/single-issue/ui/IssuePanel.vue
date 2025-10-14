<template>
  <q-layout v-if="issueData" class="flex flex-col no-wrap" view="hHh lpr fFf">
    <SingleIssueDrawer
      v-model="rightDrawerOpen"
      :width="dynamicWidthDrawer"
    />

    <q-page-container class="flex-grow">
      <div class="flex flex-col full-w full-height no-wrap">
        <MainIssueInfo @toggleDrawer="toggleDrawer" />

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
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
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
import { MainIssueInfo } from 'src/modules/single-issue/main-issue-info';
import LinkedIssuesPanel from '../linked-issues/ui/LinkedIssuesPanel.vue';
import { FileAttUploadProgressFunc } from 'src/interfaces/files';

// emits: ['update:issuePage'],
// stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const aiplanStore = useAiplanStore();
const workspaceStore = useWorkspaceStore();
const { hasPermissionByIssue } = useRolesStore();

// store to refs
const { currentProjectID, project } = storeToRefs(projectStore);
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
// vars
const rightDrawerOpen = ref(Screen.width > 1323);

// блок вложений
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

const dynamicWidthDrawer = computed(() =>
  Screen.width > 760 ? 400 : Screen.width * 0.9,
);

const toggleDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
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

<style lang="scss" scoped>

.issue-side-drawer {
  @media screen and (max-width: 760px) {
    width: 90% !important;
  }
}
:deep(.q-drawer) {
  position: fixed;
  top: 50px;
  margin-right: 10px !important;
  background: none;
}
</style>
