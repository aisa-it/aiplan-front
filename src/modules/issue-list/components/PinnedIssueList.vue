<template>
  <section v-if="loading">
    <div class="card-grid">
      <q-skeleton v-for="i in 20" :key="i" height="125px" />
    </div>
  </section>
  <section v-if="!loading">
    <div v-if="pinnedIssues.length" class="card-grid">
      <PinnedIssueCard
        v-for="card in pinnedIssues"
        :key="card.id"
        :card="card"
        @open-preview="openPreview"
      />
    </div>

    <div
      v-if="!pinnedIssues.length"
      class="column flex-center"
      style="width: 100%; height: calc(100vh - 148px)"
    >
      <DocumentIcon :width="56" :height="56" />
      <h6>Нет закрепленных задач</h6>
    </div>

    <IssuePreview v-model="isPreview" @open="openIssue" @close="closePreview" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Screen } from 'quasar';
import PinnedIssueCard from './PinnedIssueCard.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';

import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

const singleIssueStore = useSingleIssueStore();
const { fetchPinnedIssues } = useIssuesStore();

const { user } = storeToRefs(useUserStore());
const { project } = storeToRefs(useProjectStore());
const { pinnedIssues } = storeToRefs(useIssuesStore());
const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);

const route = useRoute();
const isMobile = computed(() => Screen.width <= 1200);
const loading = ref(true);

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

onMounted(async () => {
  try {
    loading.value = true;
    await fetchPinnedIssues(project.value.id);
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => (loading.value = false), 2000);
  }
});
</script>

<style scoped lang="scss">
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 380px));
  gap: 24px;
  padding: 24px;
}
</style>
