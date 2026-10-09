<template>
  <q-page class="row flex items-stretch content-stretch fit q-pa-none">
    <IssuePanel
      v-if="projectStore.project && !isRefreshIssue"
      @update:issue-page="updateIssue"
    />
    <IssuePageSkeleton v-else />
  </q-page>
</template>

<script setup lang="ts">
// core
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

// components
import IssuePanel from 'src/modules/single-issue/ui/IssuePanel.vue';
import IssuePageSkeleton from 'src/modules/single-issue/ui/IssuePageSkeleton.vue';

// core
const route = useRoute();

// stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();

// store to refs
const {
  issueData,
  currentIssueID,
  issueCommentsData,
  issueActivitiesData,
  issueStatusesData,
} = storeToRefs(singleIssueStore);

// metadata
const metaTitle = computed(() => {
  const issue = issueData.value;
  if (!issue || issue.id !== currentIssueID.value) return 'Загрузка...';
  return `${issue.project_detail.identifier}-${issue.sequence_id}: ${issue.name}`;
});

useMeta(() => {
  return {
    title: metaTitle.value,
  };
});

const isRefreshIssue = ref(true);

// functions
const issuePageInit = async () => {
  if (!issueData.value || issueData.value.id !== currentIssueID.value) {
    await refresh();
  }
};

const refresh = async () => {
  await singleIssueStore.getIssueData(
    route.params.workspace,
    route.params.project,
  );
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
  // Сбрасываем данные прошлой задачи: вкладки активности покажут скелетон,
  // а не чужие комментарии.
  issueCommentsData.value = undefined;
  issueActivitiesData.value = undefined;
  issueStatusesData.value = undefined;

  // Комментарии и активность грузятся параллельно и панель не задерживают:
  // она показывается, как только пришла сама задача.
  const activities = refreshActivities().catch(() => undefined);
  await Promise.allSettled([issuePageInit()]);
  isRefreshIssue.value = false;
  await activities;
};

// hooks
onMounted(async () => {
  currentIssueID.value = (route.params.issue as string) ?? '';
  await refreshPromise();
});

onBeforeRouteLeave(async (to, from, next) => {
  singleIssueStore.clearCurrentIssueState();
  next();
});
</script>
