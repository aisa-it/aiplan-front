<template>
  <div v-if="issueStatusesData" class="column flex full-height">
    <q-list
      v-if="issueStatusesData.activities.length"
      class="statuses-list bg-activities flex-grow"
    >
      <div
        v-for="m in issueStatusesData.activities"
        :key="m.id"
        class="row centered-horisontally no-wrap"
      >
        <AvatarImage
          border
          :style="'margin-right: 10px; margin-left: 10px;'"
          rounded
          :tooltip="aiplan.UserName(m.actor_detail).join(' ')"
          :text="
            [
              aiplan.UserName(m.actor_detail)[0]?.at(0),
              aiplan.UserName(m.actor_detail)[1]?.at(0),
            ].join(' ')
          "
          :image="m.actor_detail.avatar_id"
          :member="m.actor_detail"
          @click.stop="navigateToActivityPage(m.actor_detail.id)"
        />
        <q-item dense class="base-card q-mt-sm q-mb-sm q-pa-sm bg-base">
          <q-item-section>
            <q-item-label>
              <strong>
                {{ aiplan.UserName(m.actor_detail).join(' ') }}
              </strong>
              <span> изменил(а) статус:</span>
              <div class="status-change-wrapper">
                <div class="centered-horisontally">
                  <q-badge
                    rounded
                    class="q-mr-sm"
                    :style="{ backgroundColor: defineColor(m.old_identifier) }"
                  />

                  {{ m.old_value }}
                </div>
                <ArrowRight2 />
                <div class="centered-horisontally">
                  <q-badge
                    rounded
                    class="q-mr-sm"
                    :style="{ backgroundColor: defineColor(m.new_identifier) }"
                  />{{ m.new_value }}
                </div>
              </div>
            </q-item-label>
            <q-item-label caption class="activite-time sub-text"
              ><span>
                {{ formatDateTime(m.created_at) }}
              </span>
              <span> В статусе: {{ msToRussianTime(m.state_lag_ms) }} </span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <q-btn
        v-if="issueStatusesData.count > issueStatusesData.limit"
        outline
        color="primary"
        class="secondary-btn self-center"
        no-caps
        @click="handleRefresh"
      >
        Загрузить ещё
      </q-btn>
    </q-list>
    <div v-else class="q-mt-lg q-mb-md q-px-sm">
      <span class="body-1 header-title-text">Статус задачи не менялся</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { ref, watch, onMounted, onUnmounted } from 'vue';

// store
import { useProjectStore } from 'src/stores/project-store';
import { useStatesStore } from 'src/stores/states-store';
import { useSingleIssueStore } from 'stores/single-issue-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// utils
import aiplan from 'src/utils/aiplan';
import { msToRussianTime, formatDateTime } from 'src/utils/time';
import { setIntervalFunction } from 'src/utils/helpers';

// composables
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

//components
import AvatarImage from './AvatarImage.vue';
import ArrowRight2 from './icons/ArrowRight2.vue';

const props = defineProps<{ projectid?: string }>();

const emits = defineEmits<{
  updateComponent: [];
}>();

// stores
const statesStore = useStatesStore();
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const workspaceStore = useWorkspaceStore();

// store to refs
const { currentProjectID } = storeToRefs(projectStore);
const { issueStatusesData } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const { navigateToActivityPage } = useUserActivityNavigation();

// vars
const q = useQuasar();
const page = ref(1);
const pageSize = ref(25);
const defaultPageSize = 100;
const states = ref([]);
const statusCycle = ref();

// functions
const refresh = async () => {
  await singleIssueStore.getIssueActivitiesList(
    page.value,
    pageSize.value,
    'state',
    props.projectid,
  );
  emits('updateComponent');
};

const defineColor = (status_id: string): string => {
  return states.value.find((s) => s.id === status_id)?.color ?? '';
};

const setIntervalRefresh = () => {
  statusCycle.value = setIntervalFunction(refresh);
};

const resetAndRefresh = async () => {
  clearInterval(statusCycle.value);
  await refresh();
  setIntervalRefresh();
};

const handleRefresh = () => {
  if (issueStatusesData.value.count > issueStatusesData.value.limit) {
    pageSize.value += defaultPageSize;
    resetAndRefresh();
  }
};

// hook

onMounted(async () => {
  await statesStore
    .getStatesByProject(
      currentWorkspaceSlug.value,
      props.projectid ?? currentProjectID.value,
    )
    .then(({ data }) => {
      for (let state in data) {
        states.value = states.value.concat(data[state]);
      }
    });

  await refresh();
  setIntervalRefresh();
});

watch(
  () => page.value,
  async () => {
    await resetAndRefresh();
  },
);

watch(
  () => q.appVisible,
  (isVisible) => {
    if (!isVisible) {
      clearInterval(statusCycle.value);
    } else {
      resetAndRefresh();
    }
  },
);

onUnmounted(() => {
  clearInterval(statusCycle.value);
});
</script>

<style scoped lang="scss">
.status-change-wrapper {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.activite-time {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
}

.statuses-list {
  display: flex;
  flex-direction: column;
  padding-right: 5px;
  padding-bottom: 8px;
}
</style>
