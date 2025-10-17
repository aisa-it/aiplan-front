<template>
  <IssuesExpansionItem v-if="linkedIssues.length" v-model="isExpanded">
    <template v-slot:header>
      <LinkedIssuesHeader
        @on-add-click="isOpenAdditionLinkedIssue = true"
        v-model:is-expanded="isExpanded"
        :linked-issues-count="linkedIssues.length"
        :has-permission-by-issue="
          hasPermissionByIssue(issueData, project, 'add-linked-issue')
        "
      />
    </template>
    <LinkedIssuesList
      v-model:linked-issues="linkedIssues"
      :has-permission-by-issue="
        hasPermissionByIssue(issueData, project, 'add-linked-issue')
      "
      @remove-issue="removeIssue"
    />
  </IssuesExpansionItem>
  <q-item
    v-if="!linkedIssues.length"
    :style="'width: 100%; gap:10px; padding: 8px'"
  >
    <div class="flex centered-horisontally justify-between full-w">
      <h6 class="flex items-center" style="margin: 0px !important">
        Связи
        <IssuesColorCountTitle
          :count="linkedIssues.length"
          :badgeClass="'circle-badge-issue'"
        />
      </h6>

      <q-btn
        v-if="hasPermissionByIssue(issueData, project, 'add-linked-issue')"
        no-caps
        class="btn-only-icon-sm q-ml-sm"
        @click="() => (isOpenAdditionLinkedIssue = true)"
      >
        <AddIcon></AddIcon
      ></q-btn>
    </div>
  </q-item>
  <SelectIssueDialog
    v-model="isOpenAdditionLinkedIssue"
    :projectIdentifier="project?.identifier"
    :issues="linkedIssuesIds"
    :loading="loading"
    :allAllowed="true"
    multi
    @refresh="onLoad"
    @multi-select="(ids) => handleSaveLinkedIssues(ids, 'save')"
  />
</template>

<script setup lang="ts">
// core
import { EventBus } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, ref, onBeforeUnmount } from 'vue';

// stores
import { useRolesStore } from 'stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import SelectIssueDialog from 'src/components/dialogs/IssueDialogs/SelectIssueDialog.vue';
import AddIcon from 'src/components/icons/AddIcon.vue';
import IssuesExpansionItem from 'src/modules/single-issue/ui/components/IssuesExpansionItem.vue';

// interfaces
import { IIssueSelectRequest } from 'src/interfaces/issues';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// composables
import { useLoad } from 'src/composables/useLoad';
import IssuesColorCountTitle from 'src/components/IssuesColorCountTitle.vue';
import LinkedIssuesHeader from './LinkedIssuesHeader.vue';
import LinkedIssuesList from './LinkedIssuesList.vue';

//api
import {
  getAvailableLinkedIssues,
  getLinkedIssues,
  addIssueLinkedIssueList,
} from '../services/api';
import { setIntervalFunction } from 'src/utils/helpers';

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { hasPermissionByIssue } = useRolesStore();
const { setNotificationView } = useNotificationStore();

const bus = inject('bus') as EventBus;

const { currentProjectID, project } = storeToRefs(projectStore);
const { currentIssueID, issueData } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const linkedIssues = ref<DtoIssue[]>([]);

const linkedIssuesIds = computed<string[]>(() => {
  if (!linkedIssues.value.length) return [];
  return linkedIssues.value.flatMap((issue) => (issue?.id ? [issue.id] : []));
});

const isOpenAdditionLinkedIssue = ref(false);

const isExpanded = ref(true);

const handleSaveLinkedIssues = async (ids: string[], type?: string) => {
  if (!currentWorkspaceSlug.value) return;
  await addIssueLinkedIssueList(
    currentWorkspaceSlug.value,
    currentProjectID.value,
    currentIssueID.value,
    { issue_ids: ids },
  ).then(() => {
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: type === 'save' ? 'Связь добавлена' : 'Связь удалена',
    });
  });

  await refresh();
};

const refresh = async () => {
  if (!currentWorkspaceSlug.value || !currentProjectID.value || !currentIssueID.value) return;
  const data = await getLinkedIssues(
    currentWorkspaceSlug.value,
    currentProjectID.value,
    currentIssueID.value,
  );
  if (data) linkedIssues.value = data;
};

const removeIssue = async (id: string) => {
  if (!linkedIssues.value.length) return;
  const ids = linkedIssuesIds.value.filter((issue_id) => issue_id !== id);
  await handleSaveLinkedIssues(ids, 'remove');
  await refresh();
};

const onRequest = async (params: IIssueSelectRequest) => {
  if (!workspaceStore.currentWorkspaceSlug) return;
  const data = await getAvailableLinkedIssues(
    workspaceStore.currentWorkspaceSlug,
    projectStore.currentProjectID,
    singleIssueStore.currentIssueID,
    params,
  );
  if (data) {
    bus.emit('updateSelectIssue', data);
  }
};
const { loading, onLoad } = useLoad(onRequest);

const refreshCycle = ref();

onMounted(async () => {
  await refresh();
  refreshCycle.value = setIntervalFunction(refresh);
});

onBeforeUnmount(() => {
  clearInterval(refreshCycle.value);
});
</script>
