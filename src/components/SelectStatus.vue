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
    :class="`${issue ? 'base-selector-sm' : 'base-selector'}`"
    :style="'width: 160px'"
    dense
    @popup-show="() => refresh()"
  >
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

<script lang="ts">
// core
import { storeToRefs } from 'pinia';
import { defineComponent, ref, watch, onMounted } from 'vue';

// store
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useStatesStore } from 'src/stores/states-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

// interfaces
import { IState } from 'src/interfaces/states';

export default defineComponent({
  name: 'SelectStatus',
  props: {
    projectid: {
      type: String,
      required: true,
    },
    issueid: {
      type: String,
      required: false,
    },
    status: {
      type: Object,
      required: false,
    },
    issue: {
      type: Object,
      required: false,
    },
    statesFromCache: {
      type: Object,
      required: false,
    },
    isDisabled: { type: Boolean, required: false, default: () => false },
    label: { type: String, required: false, default: () => '' },
  },
  emits: ['setStatus', 'update-initial-status', 'update:status', 'refresh'],
  setup(props, { emit }) {
    const api = useAiplanStore();
    const statesStore = useStatesStore();
    const workspaceStore = useWorkspaceStore();
    const singleIssueStore = useSingleIssueStore();
    const { setNotificationView } = useNotificationStore();

    const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

    const states = ref<IState[]>([]);
    const open = ref();

    const selectStatusRef = ref();
    const { getWidthStyle: selectStatusWidth } =
      useResizeObserverSelect(selectStatusRef);

    const refresh = async () => {
      const { data } = props.issue?.project_detail
        ? { data: props.statesFromCache }
        : await statesStore.getStatesByProject(
            currentWorkspaceSlug.value,
            props.projectid,
          );
      let arr: any = [];
      for (const n in data) {
        arr = arr.concat(data[n]);
      }
      states.value = arr;
      if (arr.every((el) => el.id !== props.status?.id))
        emit(
          'update-initial-status',
          arr.find((status) => status.default === true) || arr[0],
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
        await singleIssueStore
          .updateIssueData(
            currentWorkspaceSlug.value,
            props.projectid,
            props.issueid,
            {
              state: state.id,
            },
          )
          .then(() => {
            useSprintStore().triggerSprintRefresh();
            showNotification('success');
            emit('setStatus', state);
            emit('refresh');
          });
      }
    };

    watch(
      () => props.projectid,
      () => refresh(),
    );

    watch(
      () => props.statesFromCache,
      () => refresh(),
    );

    watch(
      () => props.status,
      () => (open.value = props.status),
    );
    onMounted(() => {
      refresh();
    });
    return {
      api,
      open,
      states,
      refresh,
      selectStatusRef,
      issueStateUpdate,
      selectStatusWidth,
    };
  },
});
</script>
