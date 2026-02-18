<template>
  <section class="pinned-issues" v-if="!loading">
    <PinnedIssueCard
      v-for="card in pinnedIssues"
      :key="card.id"
      :card="card"
      @open-preview="openPreview"
    />

    <IssuePreview v-model="isPreview" @open="openIssue" @close="closePreview" />
  </section>

  <section v-else class="pinned-issues">
    <q-skeleton v-for="i in 10" :key="i" height="148px" />
  </section>

  <div
    v-if="!loading && !pinnedIssues.length"
    class="column flex-center"
    style="width: 100%; height: calc(100vh - 148px)"
  >
    <DocumentIcon :width="56" :height="56" />
    <h6>Нет закрепленных задач</h6>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch, onMounted, ref } from 'vue';
import { Screen } from 'quasar';
import PinnedIssueCard from './PinnedIssueCard.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';

import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { useIssuesStore } from 'src/stores/issues-store';

const props = defineProps<{
  projectId: string;
}>();

const route = useRoute();
const { user } = storeToRefs(useUserStore());
const singleIssueStore = useSingleIssueStore();
const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);
const issuesStore = useIssuesStore();
const { pinnedIssues } = storeToRefs(issuesStore);

const loading = ref(false);

onMounted(async () => {
  try {
    loading.value = true;
    await issuesStore.fetchPinnedIssues(props.projectId);
  } finally {
    loading.value = false;
  }
});

const isMobile = computed(() => Screen.width <= 1200);

async function openPreview(id: string): Promise<void> {
  if (!route.params.workspace || !route.params.project) return;
  if ((currentIssueID.value === id && isPreview.value) || isMobile.value) {
    openIssue(id);
    return;
  }
  isPreview.value = false;
  issueCommentsData.value = undefined;
  issueActivitiesData.value = undefined;
  currentIssueID.value = id;

  await singleIssueStore.getIssueData(
    route.params.workspace as string,
    route.params.project as string,
  );
  isPreview.value = true;
}

async function closePreview(): Promise<void> {
  if (!isPreview.value) return;
  isPreview.value = false;
  currentIssueID.value = '';
}

async function openIssue(id: string): Promise<void> {
  isPreview.value = false;

  singleIssueStore.openIssue(
    id,
    user.value.theme?.open_in_new ? '_blank' : '_self',
  );
}

watch(isMobile, () => {
  if (isMobile.value) closePreview();
});

onBeforeUnmount(() => {
  closePreview();
});
</script>

<style scoped lang="scss">
.pinned-issues {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  > * {
    flex: 0 0 calc((100% - 16px) / 3);
  }
}
</style>
