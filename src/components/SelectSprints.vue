<template>
  <q-select
    ref="selectSprintRef"
    dense
    multiple
    clearable
    map-options
    class="base-selector"
    :hide-dropdown-icon="hideDropdownIcon"
    popup-content-class="inh-popup scrollable-content"
    :class="{ 'adaptive-select': isAdaptiveSelect }"
    :popup-content-style="selectSprintWidth"
    :label="label"
    :disable="isDisabled"
    :modelValue="currentSprints"
    :option-label="(v) => v.name"
    :option-value="(v) => v.id"
    :options="sprintsList"
    :loading="loading || isLoading"
    @popup-show="() => (isOpen = true)"
    @popup-hide="() => (isOpen = false)"
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

    <template v-slot:option="scope">
      <q-item v-if="scope.opt.name" v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label
            >{{ scope.opt.name }}
            {{
              getSprintDates(
                scope.opt?.start_date ?? '',
                scope.opt?.end_date ?? '',
              )
            }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
//core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

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
  AiplanRequestIssueIdList,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getSprintDates } from 'src/modules/sprints/helpres';
import { sprintIssuesUpdate } from '../modules/sprints/services/api';

// constants
const ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
} as const;

const props = withDefaults(
  defineProps<{
    issueid?: string | null;
    currentSprints?: DtoSprintLight[];
    isDisabled?: boolean;
    label?: string;
    isAdaptiveSelect?: boolean;
    hideDropdownIcon?: boolean;
    isLoading?: boolean;
  }>(),
  {
    isDisabled: () => false,
    label: () => 'Спринт',
    hideDropdownIcon: () => false,
  },
);

const emit = defineEmits(['refresh']);

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

//composibles
const { getWidthStyle: selectSprintWidth } =
  useResizeObserverSelect(selectSprintRef);

//methods
const handleUpdateSprints = async (
  sprint: DtoSprintLight,
  action: (typeof ACTIONS)[keyof typeof ACTIONS],
) => {
  if (props.issueid) {
    const data: AiplanRequestIssueIdList = {
      [action === ACTIONS.ADD ? 'issues_add' : 'issues_remove']: [
        props.issueid,
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

    sprintStore.triggerSprintRefresh();

    setNotificationView({ open: true, type: 'success' });
    emit('refresh');
  }
};
</script>
