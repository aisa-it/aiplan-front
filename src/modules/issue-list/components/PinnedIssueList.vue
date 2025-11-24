<template>
  <section class="pinned-issues">
    <h6 class="pinned-issues__heading">Закрепленные задачи</h6>
    <div
      ref="scrollContainer"
      class="pinned-issues__list row scroll-attachments scrollable-content"
      @scroll="scrollManager?.updateBtnVisible()"
    >
      <div class="container-btn-scroll">
        <q-btn
          padding="5px 5px"
          class="btn-scroll-attachments"
          @click="scroll(-300)"
          :style="
            !scrollManager?.scrollState.showLeftArrow
              ? `visibility: hidden;`
              : ``
          "
        >
          <template v-slot:default>
            <q-icon size="25px" name="chevron_left" />
          </template>
        </q-btn>
        <q-btn
          padding="5px 5px"
          class="btn-scroll-attachments"
          @click="scroll(300)"
          :style="
            !scrollManager?.scrollState.showRightArrow
              ? `visibility: hidden;`
              : ``
          "
        >
          <template v-slot:default>
            <q-icon size="25px" name="chevron_right" />
          </template>
        </q-btn>
      </div>

      <PinnedIssueCard
        v-for="card in props.pinnedIssues"
        :key="card.id"
        :card="card"
        @open-preview="openPreview"
      />
    </div>

    <IssuePreview v-model="isPreview" @open="openIssue" @close="closePreview" />
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { Screen } from 'quasar';
import PinnedIssueCard from './PinnedIssueCard.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';

import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';

const props = defineProps<{
  pinnedIssues: any[];
}>();

const route = useRoute();
const { user } = storeToRefs(useUserStore());
const singleIssueStore = useSingleIssueStore();
const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);

const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();
const refreshCycle = ref();
const abortController = new AbortController();

const isMobile = computed(() => Screen.width <= 1200);
const scroll = (direction: number): void => {
  scrollManager.value?.scroll(direction);
};

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

onMounted(() => {
  scrollManager.value = new ScrollManager(scrollContainer.value, false);
  scrollManager.value?.setResize();
  if (
    scrollManager.value?.scrollState.showLeftArrow ||
    scrollManager.value?.scrollState.showRightArrow
  ) {
    mouseWheelScrollHandler(scrollContainer.value, false);
  }
});

onBeforeUnmount(() => {
  if (scrollManager.value) {
    scrollManager.value.removeResize();
  }
  abortController.abort();

  clearInterval(refreshCycle.value);
});

watch(
  () => props.pinnedIssues.length,
  () =>
    nextTick(() => {
      scrollManager.value?.updateBtnVisible();
      if (
        scrollManager.value?.scrollState.showLeftArrow ||
        scrollManager.value?.scrollState.showRightArrow
      ) {
        mouseWheelScrollHandler(scrollContainer.value, false);
      } else {
        scrollContainer.value.onwheel = null;
      }
    }),
);

watch(isMobile, () => {
  if (isMobile.value) closePreview();
});

onBeforeUnmount(() => {
  closePreview();
});
</script>

<style scoped lang="scss">
.pinned-issues {
  &__heading {
    margin-top: 0px !important;
    font-weight: 500;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: 0.15px;
  }

  &__list {
    display: flex;
    flex-wrap: nowrap;
    gap: 16px;
  }
}

.scroll-attachments {
  display: flex;
  height: 155px;
  overflow-x: auto;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 2px;
}

.container-btn-scroll {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  visibility: hidden;
  justify-content: space-between;

  .btn-scroll-attachments {
    margin: 0 8px;
  }
}
</style>
