<template>
  <q-select
    v-if="status"
    ref="selectStatusRef"
    :label="label || undefined"
    :disable="isDisabled"
    v-model="open"
    no-wrap
    no-caps
    :options="states"
    :option-label="(v) => v.name"
    :option-value="(v) => v.id"
    :class="`${issue ? 'base-selector-sm' : 'base-selector'} ${isAdaptiveSelect ? 'adaptive-select' : ''}`"
    :style="{ width: isAdaptiveSelect ? '' : '160px' }"
    dense
    @popup-show="
      () => {
        refresh();
        $emit('popup-show');
      }
    "
    @popup-hide="$emit('popup-hide')"
  >
    <template v-slot:no-option></template>
    <template v-slot:option="scope">
      <q-item
        clickable
        v-close-popup
        :key="scope.opt.id"
        class="word-wrap"
        @click="async () => await issueStateUpdate(scope.opt)"
      >
        <q-item-section>
          <div class="full-w" style="display: flex; align-items: center">
            <q-badge
              rounded
              class="q-mr-sm"
              :style="{ backgroundColor: scope.opt.color }"
              style="height: 12px; width: 12px"
            /><span class="word-wrap" style="width: 95%">
              {{ scope.opt.name }}
            </span>
          </div>
        </q-item-section>
        <q-item-section side v-if="scope.opt.id === status.id" class="q-ml-sm">
          <q-icon name="done" />
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
      >
        <q-badge
          rounded
          style="margin-right: 8px"
          :style="{ backgroundColor: status.color }"
        />{{ status.name }}
      </div>
    </template>
  </q-select>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

// store
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useStatesStore } from 'src/stores/states-store';
import {
  NotUpdated,
  useSprintStore,
} from 'src/modules/sprints/stores/sprint-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';
import {
  useIssuesStatesFlowStore,
} from 'src/stores/issues-states-flow-store';
import { useProjectStatesFlowStore } from 'src/stores/project-states-flow-store';

// utils
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

// interfaces
import { IState } from 'src/interfaces/states';
import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { isObjectsEqual } from 'src/utils/helpers';

defineOptions({
  name: 'SelectStatus',
});

const props = 
  defineProps<{
    projectid: string;
    issueid?: string;
    status?: {
      id?: string;
      color?: string;
      name?: string;
    };
    issue?: {
      project_detail?: unknown;
    };
    statesFromCache?: Record<string, IState[]>;
    isAdaptiveSelect?: boolean;
    isDisabled?: boolean;
    label?: string;
  }>();

const emit = defineEmits([
  'setStatus',
  'update-initial-status',
  'update:status',
  'refresh',
  'popup-show',
  'popup-hide',
]);

useAiplanStore();
const statesStore = useStatesStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();
const issuesStatesFlowStore = useIssuesStatesFlowStore();
const projectStatesFlowStore = useProjectStatesFlowStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const states = ref<IState[]>([]);
const open = ref();

const selectStatusRef = ref();
useResizeObserverSelect(selectStatusRef);

const refresh = async () => {
  const workspaceSlug = currentWorkspaceSlug.value;
  const { data } = props.issue?.project_detail
    ? { data: props.statesFromCache }
    : await statesStore.getStatesByProject(workspaceSlug, props.projectid);
  let arr: IState[] = [];
  for (const n in data) {
    arr = arr.concat(data[n]);
  }
  // Ограничиваем список переходов по бизнес-процессу (если ручка доступна).
  // Фолбэк: если ручка недоступна/пусто/ошибка — показываем все статусы.
  if (currentWorkspaceSlug.value) {
    try {
      if (props.issueid) {
        const available = await issuesStatesFlowStore.getAvailableStates(
          currentWorkspaceSlug.value,
          props.projectid,
          props.issueid,
        );
        arr = filterStatesByAllowedTransitions(arr, available, props.status?.id);
      } else {
        const available = await projectStatesFlowStore.getAvailableStatesNewIssue(
          currentWorkspaceSlug.value,
          props.projectid,
        );
        arr = filterStatesByAllowedTransitions(arr, available, props.status?.id);
      }
    } catch (e) {
      // ignore
    }
  }

  states.value = arr;

  if (!props.status) {
    emit(
      'update-initial-status',
      arr.find((status) => status.default === true) || arr[0],
    );
  }
};

const filterStatesByAllowedTransitions = (
  states: IState[],
  available: DtoStateLight[],
  currentStatusId: string | undefined,
) => {
  const allowedIds = new Set(available.map((s) => s.id));
  if (!allowedIds.size) return states;
  return states.filter(
    (s) => allowedIds.has(s.id) || s.id === currentStatusId,
  );
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const issueStateUpdate = async (state: IState) => {
  if (state.id === props.status?.id) return;

  if (!props.issueid) {
    emit('update:status', state);
  } else {
    if (!currentWorkspaceSlug.value) return;
    await singleIssueStore
      .updateIssueData(currentWorkspaceSlug.value, props.projectid, props.issueid, {
        state: state.id,
      })
      .then(() => {
        refresh();
        useSprintStore().triggerSprintRefresh(NotUpdated.SprintPage);
        showNotification('success');
        emit('setStatus', state);
        emit('refresh');
      });
  }
};

onMounted(() => {
  if (!props.issueid) {
    refresh();
  }
});

watch(
  () => props.projectid,
  () => refresh(),
);

watch(
  () => props.statesFromCache,
  (newVal, oldVal) => {
    if (!isObjectsEqual(newVal, oldVal)) {
      refresh();
    }
  },
);

watch(
  () => props.status,
  () => (open.value = props.status),
);
</script>
