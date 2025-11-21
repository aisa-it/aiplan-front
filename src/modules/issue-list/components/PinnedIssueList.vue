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
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PinnedIssueCard from './PinnedIssueCard.vue';

import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';

const props = defineProps<{
  pinnedIssues: any[];
}>();

const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();
const refreshCycle = ref();
const abortController = new AbortController();

const scroll = (direction: number) => {
  scrollManager.value?.scroll(direction);
};

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
