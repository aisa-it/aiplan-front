<template>
  <q-dialog @hide="reset" @show="getIssueSprints">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Выберите спринты для задачи</h6>
        <span>Отметьте спринты, в которых должна участвовать задача</span>
      </q-card-section>
      <q-card-section
        class="column q-pt-none scrollable-content"
        style="max-height: 60vh; overflow: scroll"
      >
        <q-list>
          <q-item
            v-for="sprint in sprintsList"
            :key="sprint.id"
            class="menu-link__item row items-center"
            style="padding-top: 0; padding-bottom: 0"
          >
            <q-item-section side>
              <q-checkbox v-model="selectedSprints" :val="sprint.id" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="abbriviated-text">
                {{ sprint.name }}
                {{
                  getSprintDates(
                    sprint?.start_date ?? '',
                    sprint?.end_date ?? '',
                  )
                }}
              </q-item-label>
              <HintTooltip
                anchor="bottom start"
                self="bottom start"
                :offset="[0, 42]"
              >
                {{ sprint.name }}
              </HintTooltip>
            </q-item-section>
          </q-item>
        </q-list>
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

<script lang="ts" setup>
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

const props = defineProps<{
  issue: any;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const workspaceStore = useWorkspaceStore();
const sprintStore = useSprintStore();
const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { sprintsList } = storeToRefs(sprintStore);

const selectedSprints = ref([] as string[]);
const currentSprints = ref([] as string[]);
const loading = ref(true);

const addTo = computed(() => selectedSprints.value.filter(
  (id) => !currentSprints.value.includes(id),
))
const removeFrom = computed(() => currentSprints.value.filter(
  (id) => !selectedSprints.value.includes(id),
))
const isChanged = computed(() => isArraysEqual(addTo.value, removeFrom.value))

const getIssueSprints = async () => {
  const sprintIds = props.issue.sprints.map(
    (sprint: DtoSprintLight) => sprint.id,
  );
  selectedSprints.value = [...sprintIds];
  currentSprints.value = [...sprintIds];
  loading.value = false;
};

const saveIssueSprints = async () => {
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
    emit('refresh');
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_UPDATE_DATA,
    })
  } catch {}
};

const reset = () => {
  selectedSprints.value = [];
  currentSprints.value = [];
};
</script>
