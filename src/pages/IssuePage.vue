<template>
  <q-page class="row flex items-stretch content-stretch fit q-pa-none">
    <IssuePanel
      v-if="projectStore.currentProject && !isRefreshIssue"
      @update:issue-page="updateIssue"
    />
    <q-inner-loading v-else showing>
      <DefaultLoader />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
// core
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

// components
import IssuePanel from 'src/modules/single-issue/ui/IssuePanel.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

// core
const route = useRoute();

// stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();

// store to refs
const { issueData, currentIssueID, issueActivitiesData, issueStatusesData } =
  storeToRefs(singleIssueStore);

// metadata
const metadata = ref({
  title: 'Загрузка...',
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

const isRefreshIssue = ref(true);

// functions
const setMetaTitle = () => {
  metadata.value.title = `Задача ${issueData.value.project_detail.identifier}-${issueData.value.sequence_id}`;
};

const issuePageInit = async () => {
  if (issueData.value && issueData.value.id === currentIssueID.value) {
    setMetaTitle();
  } else {
    await refresh();
  }
};

const refresh = async () => {
  await singleIssueStore
    .getIssueData(route.params.workspace, route.params.project)
    .then(setMetaTitle);
};

const refreshActivitiesComments = async () => {
  await singleIssueStore.issueCommentsList(1, 25);
};

const refreshActivities = async () => {
  await refreshActivitiesComments();
  await singleIssueStore.getIssueActivitiesList(1, 25);
  await singleIssueStore.getIssueActivitiesList(1, 25, 'state');
};

const updateIssue = async () => {
  await refresh();
};

const refreshPromise = async () => {
  isRefreshIssue.value = true;
  issueActivitiesData.value = undefined;
  issueStatusesData.value = undefined;
  await Promise.allSettled([issuePageInit(), refreshActivities()]).then(
    () => (isRefreshIssue.value = false),
  );
};

// hooks
onMounted(async () => {
  currentIssueID.value = (route.params.issue as string) ?? '';
  await refreshPromise();
});
</script>
