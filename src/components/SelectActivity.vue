<template>
  <div v-if="activitiesData" class="column flex full-height">
    <q-list
      v-if="activitiesData.activities.length"
      class="activities-list bg-activities flex-grow"
    >
      <div v-for="m in activitiesData.activities" :key="m.id">
        <div
          v-if="m.field !== 'state'"
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
            :icon="getIcon(m.verb)"
            :member="m.actor_detail"
            @click.stop="
              $router.push({
                path: `/${currentWorkspaceSlug}/user-activities/${m.actor_detail.id}`,
              })
            "
          />
          <q-item dense class="base-card q-mt-sm q-mb-sm q-pa-sm bg-base">
            <q-item-section>
              <q-item-label class="white-space-normal">
                <strong>
                  {{ aiplan.UserName(m.actor_detail).join(' ') + ' ' }}
                </strong>
                <span v-html="getHistoryText(m, workspaceProjects)"> </span>
              </q-item-label>

              <q-item-label caption class="sub-text">{{
                formatDateTime(m.created_at)
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </div>
      <q-btn
        v-if="activitiesData.count > activitiesData.limit"
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
      <span v-if="type === 'tasks'" class="body-1 header-title-text">У этой задачи пока нет активностей</span>
      <span v-if="type === 'docs'" class="body-1 header-title-text">Для этого документа еще нет активности</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { ref, watch, onMounted, onUnmounted } from 'vue';

// store
import { useWorkspaceStore } from 'stores/workspace-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';
import { setIntervalFunction } from 'src/utils/helpers';
import { getIcon, getHistoryText } from 'src/utils/strings';

//components - icon
import AvatarImage from './AvatarImage.vue';

defineProps({
  activitiesData: {
    type: Object,
    required: true,
  },
    type: {
      type: String,
      required: true,
    }
});

const emits = defineEmits<{
  updateComponent: [];
  refreshData: [page: number, pageSize: number];
}>();

// stores
const workspaceStore = useWorkspaceStore();

// store to refs
const { workspaceProjects } = storeToRefs(workspaceStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const q = useQuasar();
const page = ref(1);
const pageSize = ref(25);
const defaultPageSize = 100;
const activityCycle = ref();

// functions
const refresh = async () => {
  emits('refreshData', page.value, pageSize.value);
  emits('updateComponent');
};

const setIntervalRefresh = () => {
  activityCycle.value = setIntervalFunction(refresh);
};

const resetAndRefresh = async () => {
  clearInterval(activityCycle.value);
  await refresh();
  setIntervalRefresh();
};

const handleRefresh = () => {
  pageSize.value += defaultPageSize;
  resetAndRefresh();
};

// hooks
onMounted(async () => {
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
      clearInterval(activityCycle.value);
    } else {
      resetAndRefresh();
    }
  },
);

onUnmounted(() => {
  clearInterval(activityCycle.value);
});
</script>

<style lang="scss" scoped>
.activities-list {
  display: flex;
  flex-direction: column;
  padding-right: 5px;
  padding-bottom: 8px;

  :deep(.white-space-normal) {
    white-space: normal;
  }
}
</style>
