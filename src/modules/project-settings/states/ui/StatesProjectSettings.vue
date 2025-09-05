<template>
  <LoadPage v-if="project === undefined" />
  <div v-else>
    <div class="q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Статусы</h4>
        <p class="text-sm text-brand-secondary">Управление статусами проекта</p>
      </div>
      <div
        class="col"
        style="
          max-height: calc(100vh - 340px);
          overflow: scroll;
          padding-right: 12px;
        "
      >
        <div
          v-for="(states, index) in projectStates"
          :key="index"
          class="q-pb-md"
        >
          <div class="row q-py-sm" :style="'align-items: center;'">
            <span :style="'font-size: 16px'">
              {{ STATES_TYPES[index]?.label ?? 'Без группы' }}
            </span>
            <q-space />
            <q-btn
              no-caps
              class="secondary-btn"
              @click="onAddOpen(STATES_TYPES[index])"
            >
              Добавить
            </q-btn>
          </div>
          <GroupStates
            :states="states"
            @refresh="refresh()"
            @refresh-states="refreshStates()"
          />
        </div>
      </div>
    </div>
    <CreateStateDialog
      v-model="isAddOpen"
      :stateType="stateType"
      @success="(msg) => onSuccess(msg)"
    />
  </div>
</template>

<script lang="ts" setup>
// core
import { onMounted, ref } from 'vue';
import { useMeta } from 'quasar';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

// stores
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { orderStateGroups } from 'src/utils/helpers';
import { sortStates } from 'src/utils/sort';

// components
import GroupStates from './GroupStates.vue';
import LoadPage from 'src/pages/LoadPage.vue';
import CreateStateDialog from 'src/modules/project-settings/states/ui/dialogs/CreateStateDialog.vue';

//constants
import { STATES_TYPES } from 'src/constants/constants';
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

// services
import { getProjectStates } from '../services/api';

// interfaces
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ISelect } from 'src/interfaces/ui';

// stores
const statesStore = useStatesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

//store to ref
const { project } = storeToRefs(projectStore);
const { statesCache } = storeToRefs(statesStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const projectStates = ref<Record<string, DtoStateLight>[]>([]);
const stateType = ref<ISelect>();
const metadata = ref({
  title: 'Загрузка...',
});

const route = useRoute();

// flags for dialogs
const isAddOpen = ref(false);

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

const setAnotherTitle = (title: string) => {
  metadata.value.title = `Настройки ${title}`;
};

const refresh = async () => {
  let temporaryProjectStates: Record<string, DtoStateLight>[] = [];
  const orderedStateGroups = orderStateGroups(
    (await getProjectStates(
      route.params.workspace as string,
      route.params.project as string,
    )) ?? {},
  );
  Object.keys(orderedStateGroups).map((key) => {
    temporaryProjectStates.push(orderedStateGroups[key]);
  });
  projectStates.value = temporaryProjectStates;
  setAnotherTitle(project.value.name);
};

onMounted(async () => refresh());

const refreshStates = async () => {
  await workspaceStore
    .getAllWorkspaceStates(currentWorkspaceSlug.value as string)
    .then(() => {
      let obj: Record<string, DtoStateLight[]> = {};
      for (let o in workspaceStore.allWorkspaceStates) {
        obj[o] = sortStates(workspaceStore.allWorkspaceStates[o]);
      }
      statesCache.value = obj;
    });
};

const onAddOpen = (st: ISelect) => {
  stateType.value = st;
  isAddOpen.value = true;
};

const onSuccess = async (msg?: string) => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
  await refresh();
  await refreshStates();
};
</script>
<style lang="scss" scoped>
.all-states > div:last-child .state {
  border: none;
}
</style>
