<template>
  <div
    class="flex"
    style="height: fit-content; position: relative; min-width: 100%"
  >
    <div
      @scroll="updateScrollState"
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
            !showLeftArrow
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
            !showRightArrow
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
// types
import { ISettingsTab } from '../types/settings-tabs';

// core
import {
  computed,
  onMounted,
  ref,
} from 'vue';

// composables
import { useHorizontalScroll } from 'src/composables/useHorizontalScroll';

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

//variables
const scrollContainer = ref<HTMLElement>();

//computeds
const tabsLength = computed(() => props.listTabs.length);

const {
  showLeftArrow,
  showRightArrow,
  scroll,
  updateScrollState,
  init: initScroll,
} = useHorizontalScroll(
  scrollContainer,
  tabsLength,
);

let timeInterval = ref<NodeJS.Timeout>();

const setScroll = () => {
  timeInterval.value = setInterval(() => {
    if (!scrollContainer?.value?.clientWidth) {
      return;
    } else {
      clearInterval(timeInterval.value)
      initScroll();
    }
  }, 500);
}

onMounted(async () => {
  setScroll();
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
