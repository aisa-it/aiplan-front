<template>
  <div
    class="flex"
    style="height: fit-content; position: relative; min-width: 100%"
  >
    <div
      @scroll="scrollManager?.updateBtnVisible()"
      ref="scrollContainer"
      class="row scroll-tabs scrollable-content"
    >
      <q-tabs
        :model-value="currentTab"
        :mobile-arrows="false"
        :class="`chips settings-tabs ${tabsClass}`"
        active-class="active"
        style="overflow: visible"
        :content-class="`q-py-md q-px-xs ${contentClass}`"
        indicator-color="transparent"
        align="left"
        no-caps
        dense
        @update:model-value="$emit('set', $event)"
      >
        <q-tab
          v-for="tab in listTabs"
          :key="tab.name"
          :data-id="tab.dataId"
          :name="tab.name"
          :label="tab.label"
          :disable="tab.isDisabled"
          class="chip settings-tabs__chip"
          no-caps
        />
      </q-tabs>
      <div class="container-btn-scroll">
        <q-btn
          padding="5px 5px"
          class="btn-scroll-tabs"
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
          class="btn-scroll-tabs"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ISettingsTab } from '../types/settings-tabs';

//utils
import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';

//variables
const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();

const props = withDefaults(
  defineProps<{
    currentTab: number;
    listTabs: ISettingsTab[];
    tabsClass?: string;
    contentClass?: string;
  }>(),
  {
    listTabs: () => [],
  },
);

defineEmits<{
  set: [currentTab: number];
}>();

const scroll = (direction: number) => {
  scrollManager.value?.scroll(direction);
};

let timeout = ref<NodeJS.Timeout>();

const checkBtnsVisibility = () => {
  if (!scrollContainer?.value?.clientWidth) {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    timeout.value = setTimeout(() => {
      checkBtnsVisibility();
    }, 500);
    return;
  } else {
    scrollManager.value?.updateBtnVisible();
    if (
      scrollManager.value?.scrollState.showLeftArrow ||
      scrollManager.value?.scrollState.showRightArrow
    ) {
      mouseWheelScrollHandler(scrollContainer.value, false);
    } else {
      scrollContainer.value.onwheel = null;
    }
    clearTimeout(timeout.value);
  }
};

onMounted(async () => {
  scrollManager.value = new ScrollManager(scrollContainer.value, false);
  scrollManager.value?.setResize();
  checkBtnsVisibility();
});

onBeforeUnmount(() => {
  if (scrollManager.value) {
    scrollManager.value.removeResize();
  }
});
</script>

<style scoped lang="scss">
.settings-tabs {
  &__chip {
    min-width: 150px;
  }
}

.scroll-tabs {
  display: flex;
  overflow-x: auto;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 100%;
}

.container-btn-scroll {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  visibility: hidden;
  justify-content: space-between;
  transform: translateY(-6px);

  .btn-scroll-tabs {
    margin: 0 8px;
  }
}
</style>
