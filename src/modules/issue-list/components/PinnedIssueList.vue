<template>
  <section
    v-if="!loading"
    class="pinned-issues hide-scrollbar"
    @scroll="onScroll"
  >
    <PinnedIssueCard
      v-for="card in pinnedIssues"
      :key="card.id"
      :card="card"
      @open-preview="openPreview"
    />

    <IssuePreview
      v-model="isPreview"
      @open="openIssue"
      @close="closePreview"
      @refresh="previewRefresh"
    />
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
import {
  computed,
  watch,
  ref,
  reactive,
  onActivated,
  onDeactivated,
} from 'vue';
import { Screen } from 'quasar';
import PinnedIssueCard from './PinnedIssueCard.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';

import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { IQuery, useIssuesStore } from 'src/stores/issues-store';
import { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  projectId: string;
}>();

const route = useRoute();
const { user } = storeToRefs(useUserStore());
const singleIssueStore = useSingleIssueStore();
const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);
const issuesStore = useIssuesStore();

const ISSUES_LIMIT = 50;
const loading = ref(false);
const countIssues = ref(0);
const pinnedIssues = ref<DtoIssueWithCount[]>([]);
const isLoadingMore = ref(false);

const pagination = reactive<IQuery>({
  offset: 0,
  limit: ISSUES_LIMIT,
});

onActivated(async () => {
  try {
    loading.value = true;
    await refresh();
  } finally {
    loading.value = false;
  }
});

onDeactivated(() => {
  clear();
  closePreview();
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

const previewRefresh = async () => {
  clear();
  await refresh();
};

const refresh = async () => {
  await issuesStore
    .fetchPinnedIssues(props.projectId, pagination)
    .then((data) => {
      countIssues.value = data.count || 0;
      pinnedIssues.value = [...pinnedIssues.value, ...(data.issues ?? [])];
    });
};

const clear = () => {
  pagination.offset = 0;
  countIssues.value = 0;
  pinnedIssues.value = [];
};

const onScroll = async (event: Event) => {
  if (isLoadingMore.value) return;

  const target = event.target as HTMLElement;
  const isBottom =
    target.scrollHeight - target.scrollTop - target.clientHeight < 200;

  if (isBottom) {
    const hasMore = pinnedIssues.value.length < countIssues.value;

    if (hasMore) {
      isLoadingMore.value = true;
      pagination.offset = (pagination.offset || 0) + ISSUES_LIMIT;
      await refresh();
      setTimeout(() => {
        isLoadingMore.value = false;
      }, 300);
    }
  }
};

watch(isMobile, () => {
  if (isMobile.value) closePreview();
});
</script>

<style scoped lang="scss">
.pinned-issues {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  overflow: auto;
  padding: 1px;
  max-height: calc(100vh - 180px);
  > * {
    @media (min-width: 768px) {
      width: calc((100% - 16px) / 3);
    }
  }
}
</style>
