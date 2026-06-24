<template>
  <q-dialog @hide="reset" @show="getIssueSprints">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Выберите спринты для задачи</h6>
        <span v-if="filteredSprints.length > 0"
          >Отметьте спринты, в которых должна участвовать {{ title }}</span
        >
        <span v-else>
          Нет активных спринтов. Чтобы добавить задачу, сначала создайте спринт.
        </span>
      </q-card-section>
      <q-card-section
        v-if="filteredSprints.length > 0"
        class="column q-pt-none scrollable-content"
        style="max-height: 60vh; overflow: scroll"
      >
        <q-tree
          :nodes="filteredSprints"
          node-key="id"
          label-key="name"
          children-key="sprints"
          dense
        >
          <template v-slot:default-header="prop">
            <q-item
              v-if="prop.node.stats"
              class="menu-link__item row items-center"
              style="padding: 0 5px"
            >
              <q-item-section side>
                <q-checkbox v-model="selectedSprints" :val="prop.node.id" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="abbriviated-text">
                  {{ prop.node.name }}
                  {{
                    getSprintDates(
                      prop.node?.start_date ?? '',
                      prop.node?.end_date ?? '',
                    )
                  }}
                </q-item-label>
                <HintTooltip
                  anchor="bottom start"
                  self="bottom start"
                  :offset="[0, 42]"
                >
                  {{ prop.node.name }}
                </HintTooltip>
              </q-item-section>
            </q-item>

            <q-item v-else class="menu-link__item row items-center">
              <q-item-section
                class="tree-custom-header__name"
                style="font-weight: 500"
              >
                {{ prop.node.name }}
              </q-item-section>
            </q-item>
          </template>
        </q-tree>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Сохранить"
          class="primary-btn"
          :disable="loading || isChanged"
          @click="saveIssueSprints"
          v-close-popup
        />
      </q-card-actions>
      <q-inner-loading :showing="loading">
        <DefaultLoader />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

// components
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

// constants
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

// utils
import { isArraysEqual } from 'src/utils/helpers';

import { sprintIssuesUpdate } from 'src/modules/sprints/services/api';
import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getSprintDates } from 'src/modules/sprints/helpres';
import { ROOT_FOLDER_ID } from 'src/constants/constants';

const props = defineProps<{
  issue: any;
  checkedSprints?: DtoSprintLight[];
}>();

const emits = defineEmits<{
  'update-selected': [DtoSprintLight[]];
  refresh: [];
  hide: [];
}>();

const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { sprintsList } = storeToRefs(sprintStore);
const sprintFolders = computed(() =>
  sprintsList.value?.filter(
    (item) => item.id !== ROOT_FOLDER_ID && item.sprints,
  ),
);

const title = computed(() => {
  if (props.issue)
    return `задача ${props.issue.project_detail?.identifier}-${props.issue.sequence_id} ${props.issue.name}`;
  return 'новая задача';
});

const rootSprints = computed(
  () => sprintsList.value?.find((item) => item.id === ROOT_FOLDER_ID)?.sprints,
);
const filteredSprints = computed(() => {
  let items = [];
  if (sprintFolders.value) {
    items.push(...sprintFolders.value);
  }
  if (rootSprints.value) {
    items.push(...rootSprints.value);
  }
  return items;
});

const selectedSprints = ref([] as string[]);
const currentSprints = ref([] as string[]);
const loading = ref(true);

const addTo = computed(() =>
  selectedSprints.value.filter((id) => !currentSprints.value.includes(id)),
);
const removeFrom = computed(() =>
  currentSprints.value.filter((id) => !selectedSprints.value.includes(id)),
);
const isChanged = computed(() => isArraysEqual(addTo.value, removeFrom.value));

const getIssueSprints = async () => {
  if (!sprintsList.value.length) {
    await sprintStore.getSprintsList(currentWorkspaceSlug.value as string);
  }

  if (!props.issue) {
    loading.value = false;
    if (props.checkedSprints) {
      const checkedIds = props.checkedSprints?.map((sprint) => sprint.id ?? '');
      selectedSprints.value = [...checkedIds];
      currentSprints.value = [...checkedIds];
    }

    return;
  }

  const sprintIds = props.issue.sprints.map(
    (sprint: DtoSprintLight) => sprint.id,
  );
  selectedSprints.value = [...sprintIds];
  currentSprints.value = [...sprintIds];
  loading.value = false;
};

const saveIssueSprints = async () => {
  if (!props.issue) {
    const resultSprints: DtoSprintLight[] = [];
    sprintsList.value.forEach((folder) =>
      folder.sprints?.forEach((sprint) => {
        if (sprint.id && selectedSprints.value.includes(sprint.id)) {
          resultSprints.push(sprint);
        }
      }),
    );
    emits('update-selected', resultSprints);
    emits('refresh');
    return;
  }
  try {
    const updatePromises = [
      ...removeFrom.value.map((sprintId) =>
        sprintIssuesUpdate(currentWorkspaceSlug.value ?? '', sprintId, {
          issues_add: [],
          issues_remove: [props.issue.id],
        }),
      ),
      ...addTo.value.map((sprintId) =>
        sprintIssuesUpdate(currentWorkspaceSlug.value ?? '', sprintId, {
          issues_add: [props.issue.id],
          issues_remove: [],
        }),
      ),
    ];
    await Promise.all(updatePromises);
    emits('refresh');
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_UPDATE_DATA,
    });
  } catch {}
};

const reset = () => {
  selectedSprints.value = [];
  currentSprints.value = [];
  emits('hide');
};
</script>
<style lang="scss" scoped>
:deep(.q-tree__node--child) {
  padding-left: 0;

  &::before {
    content: none;
  }
}
</style>
