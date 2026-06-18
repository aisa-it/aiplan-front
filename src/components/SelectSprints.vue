<template>
  <q-select
    ref="selectSprintRef"
    dense
    multiple
    :clearable="isClearable"
    map-options
    :hide-dropdown-icon="hideDropdownIcon"
    popup-content-class="inh-popup scrollable-content"
    class="issue-selector"
    :class="`${label ? 'base-selector' : 'base-selector-sm'} ${isAdaptiveSelect ? 'adaptive-select' : ''}`"
    :popup-content-style="selectSprintWidth"
    :label="label"
    :disable="isDisabled"
    :modelValue="currentSprints"
    :option-label="(v) => v.name"
    :option-value="(v) => v.id"
    :options="sprintsList"
    :loading="loading || isLoading"
    @update:model-value="handleUpdateSelected"
    @popup-show="() => (isDialogOpen = true)"
    @popup-hide="() => (isDialogOpen = false)"
    @add="(sprint) => handleUpdateSprints(sprint.value, ACTIONS.ADD)"
    @remove="(sprint) => handleUpdateSprints(sprint.value, ACTIONS.REMOVE)"
    @clear="
      (sprintsArr: DtoSprintLight[]) => {
        sprintsArr.forEach((sprint) => {
          handleUpdateSprints(sprint, ACTIONS.REMOVE);
        });
      }
    "
  >
    <template v-slot:no-option>
      <q-item class="items-center">Нет спринтов</q-item>
    </template>

    <template v-if="hideDropdownIcon" v-slot:append>
      <ArrowDown class="chevron-rotate" :class="{ 'rotate-180': isOpen }" />
    </template>

    <template v-slot:option>
    </template>

    <template v-if="!label" v-slot:selected>
      <q-item-label class="q-ml-xs ellipsis">
        {{
          !currentSprints?.length
            ? 'Не Выбран'
            : currentSprints.map((s) => s.name).join(', ')
        }}
      </q-item-label>
    </template>
  </q-select>

  <ManageIssueSprintsDialog
      v-model="isDialogOpen"
      :issue="issue"
      @refresh="emits('refresh')"
      @hide="() => selectSprintRef.hidePopup()"
    />
</template>

<script setup lang="ts">
//core
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

//utils
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

//stores
import { useWorkspaceStore } from 'stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

//icons
import ArrowDown from './icons/ArrowDown.vue';

//components
import {
  DtoRequestIssueIdList,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { sprintIssuesUpdate } from '../modules/sprints/services/api';
import ManageIssueSprintsDialog from 'src/components/dialogs/IssueDialogs/ManageIssueSprintsDialog.vue';

// constants
const ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
} as const;

const props = withDefaults(
  defineProps<{
    issue?: any;
    currentSprints?: DtoSprintLight[];
    isDisabled?: boolean;
    label?: string;
    isAdaptiveSelect?: boolean;
    hideDropdownIcon?: boolean;
    isLoading?: boolean;
  }>(),
  {
    isDisabled: () => false,
    hideDropdownIcon: () => false,
  },
);

const emits = defineEmits<{
  refresh: [];
  'update-selected': [DtoSprintLight[]];
}>();

//stores
const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { sprintsList } = storeToRefs(sprintStore);

//variables
const selectSprintRef = ref();
const loading = ref(false);
const isOpen = ref(false);

const isClearable = computed<boolean>(() => {
  return Boolean(props.currentSprints?.length);
});

//composables
const { getWidthStyle: selectSprintWidth } =
  useResizeObserverSelect(selectSprintRef);

const isDialogOpen = ref(false);

//methods
const handleUpdateSprints = async (
  sprint: DtoSprintLight,
  action: (typeof ACTIONS)[keyof typeof ACTIONS],
) => {
  if (props.issue) {
    const data: DtoRequestIssueIdList = {
      [action === ACTIONS.ADD ? 'issues_add' : 'issues_remove']: [
        props.issue.id,
      ],
    };

    await sprintIssuesUpdate(
      currentWorkspaceSlug.value ?? '',
      sprint.id ?? '',
      data,
    ).catch((err) => {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: 'Ошибка при обновлении спринтов',
      });
      throw err;
    });

    const changedSprintId = String(sprint.id ?? '');
    const activeSprintId = String(sprintStore.sprint?.id ?? '');

    if (
      changedSprintId &&
      activeSprintId &&
      changedSprintId === activeSprintId
    ) {
      sprintStore.triggerSprintRefresh();
    }

    setNotificationView({ open: true, type: 'success' });
    emits('refresh');
  }
};

const handleUpdateSelected = (value: DtoSprintLight[]) => {
  emits('update-selected', value);
};
</script>

<style scoped lang="scss">
.issue-selector {
  max-width: 100%;
  min-width: 100%;
}
</style>
