<template>
  <q-select
    ref="selectFolderRef"
    dense
    clearable
    map-options
    class="base-selector full-w"
    :hide-dropdown-icon="hideDropdownIcon"
    popup-content-class="inh-popup scrollable-content"
    :class="{ 'adaptive-select': isAdaptiveSelect }"
    :popup-content-style="selectWatcherWidth"
    label="Выберите папку"
    :disable="isDisabled"
    :modelValue="folder"
    :option-label="(v) => v.name"
    :option-value="(v) => v.id"
    :options="sprintFolders"
    :virtual-scroll-slice-ratio-before="30"
    :loading="loading || isLoading"
    @popup-show="() => (isOpen = true)"
    @popup-hide="() => (isOpen = false)"
    @update:model-value="(e) => handleUpdateFolder(e)"
  >
    <template v-slot:no-option>
      <q-item class="items-center">Нет папок</q-item>
    </template>

    <template v-if="hideDropdownIcon" v-slot:append>
      <ArrowDown class="chevron-rotate" :class="{ 'rotate-180': isOpen }" />
    </template>

    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        style="padding: 0px !important"
      >
        <q-item-section class="q-pa-xs q-pr-none items-center" avatar>
          <FolderIcon/>
        </q-item-section>
        <q-item-section class="q-py-xs q-pl-none q-pr-xs">
          <q-item-label>{{ scope.opt.name }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
//core
import { storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
//utils
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
//stores
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

//icons
import ArrowDown from '../icons/ArrowDown.vue';

//components
import { DtoSprintFolder } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ROOT_FOLDER_ID } from 'src/constants/constants.ts';
import FolderIcon from 'src/components/icons/FolderIcon.vue';

const props = withDefaults(
  defineProps<{
    sprintId?: string | null;
    folder?: DtoSprintFolder;
    isDisabled?: boolean;
    isAdaptiveSelect?: boolean;
    hideDropdownIcon?: boolean;
    isLoading?: boolean;
    debounced?: boolean;
  }>(),
  {
    isDisabled: () => false,
    hideDropdownIcon: () => false,
  },
);

const emits = defineEmits<{ refresh: []; 'update:folder': [any] }>();

//stores
const sprintStore = useSprintStore();

//storesToRefs
const { sprintsList } = storeToRefs(sprintStore);

//variables
const selectFolderRef = ref();
const loading = ref(false);
const isOpen = ref(false);

//computeds
const sprintFolders = computed(() =>
  sprintsList.value?.filter((item: DtoSprintFolder) => item.id !== ROOT_FOLDER_ID),
);

//composibles
const { getWidthStyle: selectWatcherWidth } =
  useResizeObserverSelect(selectFolderRef);

//methods
const handleUpdateFolder = (e: any) => {
  emits('update:folder', e);
  return;
}
</script>
