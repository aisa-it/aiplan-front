<template>
  <q-btn
    :class="Screen.width > 720 ? 'primary-btn-sm' : 'primary-btn-only-icon-sm'"
    flat
    dense
    no-caps
    no-wrap
    :disable="isDisabled"
    @click="addIssue"
    data-tour="create-issue"
    :style="activeGuid === 1 ? { opacity: '1 !important' } : {}"
  >
    <AddIcon :color="'#fff'" />
    <span v-if="Screen.width > 720"> Создать </span>
    <HintTooltip v-if="!isAIDoc && workspaceProjects.length === 0">
      Создать задачу можно только если есть хотя бы один проект
    </HintTooltip>
  </q-btn>
  <NewIssueDialog
    v-if="isNewIssueDialogOpened"
    v-model="isNewIssueDialogOpened"
    @on-project-created="isProjectCreateOpen = true"
    @update="refreshIssues = true"
  />
  <NewProjectDialog v-if="isProjectCreateOpen" v-model="isProjectCreateOpen" />
  <CreateDocPageDialog v-if="isDocCreateOpen" v-model="isDocCreateOpen" />
</template>

<script setup lang="ts">
// core
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useGuiderStore } from 'src/modules/guided-tours/guider-store';
// components
import AddIcon from 'src/components/icons/AddIcon.vue';
import NewIssueDialog from './NewIssueDialog.vue';
import NewProjectDialog from './dialogs/NewProjectDialog.vue';
import CreateDocPageDialog from './dialogs/AIDocDialogs/CreateDocPageDialog.vue';

// route
const route = useRoute();

// stores
const issuesStore = useIssuesStore();
const workspaceStore = useWorkspaceStore();

// refs from stores
const { refreshIssues } = storeToRefs(issuesStore);
const { workspaceProjects, workspaceInfo } = storeToRefs(workspaceStore);
const { activeGuid } = storeToRefs(useGuiderStore());

// local state
const isProjectCreateOpen = ref(false);
const isDocCreateOpen = ref(false);
const isNewIssueDialogOpened = ref(false);

// computed
const isAIDoc = computed(() => route.fullPath.includes('aidoc'));

const currentWorkspaceRole = computed(
  () => workspaceInfo.value?.current_user_membership?.role,
);

const isDisabled = computed(() => {
  return (
    (isAIDoc.value && currentWorkspaceRole.value < 10) ||
    (!isAIDoc.value &&
      (workspaceProjects.value.length === 0 ||
        !workspaceProjects.value.find(
          (project) => project?.current_user_membership?.role > 5,
        )))
  );
});

// methods
const addIssue = () => {
  if (isAIDoc.value) {
    isDocCreateOpen.value = true;
  } else {
    isNewIssueDialogOpened.value = true;
  }
};
</script>
