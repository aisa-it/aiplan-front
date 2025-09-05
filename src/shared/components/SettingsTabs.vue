<template>
  <q-tabs
    :model-value="currentTab"
    :mobile-arrows="false"
    class="chips settings-tabs"
    active-class="active"
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
</template>

<script setup lang="ts">
import { ISettingsTab } from '../types/settings-tabs';

withDefaults(
  defineProps<{
    currentTab: number;
    listTabs: ISettingsTab[];
    contentClass?: string;
  }>(),
  {
    listTabs: () => [],
  },
);

defineEmits<{
  set: [currentTab: number];
}>();
</script>

<style scoped lang="scss">
.settings-tabs {
  &__chip {
    min-width: 150px;
  }
}
</style>
