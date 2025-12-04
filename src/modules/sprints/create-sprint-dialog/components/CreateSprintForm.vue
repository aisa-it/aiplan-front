<template>
  <div class="column w-full h-full" style="max-height: 100%; overflow: hidden">
    <div class="col-auto q-mb-lg">
      <q-input
        ref="nameRef"
        v-model="sprintName"
        class="q-mb-sm base-input q-pa-none"
        label="Название спринта"
        :rules="[(val) => !!val || 'Необходимо ввести название спринта']"
        dense
      />
    </div>
    <div
      class="col column no-wrap"
      style="overflow-y: scroll; margin-bottom: 24px"
    >
      <div class="col-auto">
        <div class="row q-mb-md centered-horisontally">
          <div class="col centered-horisontally">
            <ObserveIcon />
            <span class="q-ml-sm"> Наблюдатели </span>
          </div>

          <SelectWatchers
            v-model:watchers="watchers"
            :current-member="user"
            label="Выберите наблюдателя"
            class="col centered-horisontally"
          />
        </div>

        <div class="q-mb-md">
          <div class="row centered-horisontally">
            <div class="col centered-horisontally">
              <WatchDashedIcon />
              <span class="q-ml-sm"> Интервал </span>
            </div>
            <CreateSprintDateRange
              class="col"
              v-model="dateRange"
              :class="{ 'error-date': dateError }"
            />
          </div>
          <div v-if="dateError" class="text-negative text-caption q-mt-xs">
            {{ dateError }}
          </div>
        </div>
      </div>

      <p class="q-mb-md">Цель спринта:</p>
      <EditorTipTapV2
        v-model="description"
        editor-id="create-sprint-editor"
        class="issue-panel__editor col-auto q-mb-lg"
        style="height: 312px"
      />

      <div class="tasks-wrapper column no-wrap">
        <div class="centered-horisontally q-mb-sm">
          <LinkIcon />
          <span class="q-ml-sm">Задачи</span>
        </div>

        <SelectSprintIssues
          v-if="issues && issues.length > 0"
          :issues="issues"
          @delete="(id) => emit('delete', id)"
          class="visible-scroll issues-scroll"
          style="min-height: 216px; height: 100%"
        />
      </div>
    </div>

    <q-btn
      :label="defaultProps ? 'Обновить спринт' : 'Создать спринт'"
      flat
      dense
      no-caps
      class="primary-btn"
      style="width: 100%"
      @click="pushData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';

import SelectWatchers from 'src/components/selects/SelectWatchers.vue';
import CreateSprintDateRange from './CreateSprintDateRange.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import SelectSprintIssues from './SelectSprintIssues.vue';

import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import WatchDashedIcon from 'src/components/icons/WatchDashedIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import {
  DtoIssueLight,
  DtoSprint,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  issues?: DtoIssueLight[];
  defaultProps?: DtoSprint | null;
}>();

const emit = defineEmits<{
  delete: [id: string];
  create: [data: any];
  edit: [data: any];
}>();

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

const nameRef = ref();

const dateError = computed(() => {
  if (!dateRange.value.from || !dateRange.value.to)
    return 'Необходимо ввести даты начала и конца спринта';
  return '';
});

const sprintName = ref(props.defaultProps?.name ?? '');
const watchers = ref<any>(
  props.defaultProps?.watchers?.map((el) => el.id) ?? [],
);

const dateRange = ref({
  from: props.defaultProps?.start_date
    ? dayjs.utc(props.defaultProps.start_date).format('DD.MM.YYYY')
    : dayjs.utc().format('DD.MM.YYYY'),

  to: props.defaultProps?.end_date
    ? dayjs.utc(props.defaultProps.end_date).format('DD.MM.YYYY')
    : dayjs.utc().add(7, 'day').format('DD.MM.YYYY'),
});

const description = ref(props.defaultProps?.description ?? '');

const toISO = (data: string) => {
  const parsed = dayjs.utc(data, 'DD.MM.YYYY', true);
  if (!parsed.isValid()) return null;

  return parsed.startOf('day').toISOString();
};

const removeAndAddArrayHelper = <T extends { id?: string }>(
  startData: T[] | undefined,
  currentData: T[] = [],
) => {
  if (!props.defaultProps || !startData?.length)
    return {
      remove: [],
      add: currentData.map((el) => el.id),
    };

  if (!currentData) return { remove: [], add: [] };

  const remove =
    startData.filter((el) => !currentData.some((i) => i.id === el.id)) ?? [];

  const add =
    currentData.filter((el) => !remove?.some((del) => del.id === el.id)) ?? [];

  return {
    remove: remove.map((el) => el.id),
    add: add.map((el) => el.id),
  };
};

const removeAndAddWatcher = () => {
  if (!props.defaultProps?.watchers || !props.defaultProps?.watchers.length) {
    return {
      add: watchers.value,
      remove: [],
    };
  }

  if (!watchers.value) return { remove: [], add: [] };

  const remove =
    props.defaultProps?.watchers?.filter(
      (el) => !watchers.value.some((i) => i === el.id),
    ) ?? [];

  const add =
    watchers.value.filter((el) => !remove?.some((del) => del.id === el)) ?? [];

  return {
    remove: remove.map((el) => el.id),
    add: add,
  };
};

const pushData = () => {
  const isValidName = nameRef.value.validate();

  const isValidDates =
    !!dateRange.value.from &&
    !!dateRange.value.to &&
    toISO(dateRange.value.from) &&
    toISO(dateRange.value.to);

  if (!isValidName || !isValidDates) {
    return;
  }

  const { remove: removeIssues, add: addIssues } = removeAndAddArrayHelper(
    props.defaultProps?.issues,
    props.issues,
  );

  const { remove: removeWatchers, add: addWatchers } = removeAndAddWatcher();

  const data = {
    createSprintData: {
      name: sprintName.value,
      description: description.value,
      start_date: toISO(dateRange.value.from),
      end_date: toISO(dateRange.value.to),
    },
    issuesSprint: { issues_add: addIssues, issues_remove: removeIssues },
    membersSprint: { members_add: addWatchers, members_remove: removeWatchers },
  };

  if (props.defaultProps) {
    emit('edit', data);
  } else {
    emit('create', data);
  }
};

watch(
  () => props.defaultProps,
  () => {
    if (!props.defaultProps) return;

    sprintName.value = props.defaultProps?.name ?? '';
    watchers.value = props.defaultProps?.watchers?.map((el) => el.id) ?? [];

    dateRange.value = {
      from: props.defaultProps?.start_date
        ? dayjs.utc(props.defaultProps.start_date).format('DD.MM.YYYY')
        : dayjs.utc().format('DD.MM.YYYY'),

      to: props.defaultProps?.end_date
        ? dayjs.utc(props.defaultProps.end_date).format('DD.MM.YYYY')
        : dayjs.utc().add(7, 'day').format('DD.MM.YYYY'),
    };

    description.value = props.defaultProps?.description ?? '';
  },
);
</script>

<style scoped lang="scss">
.visible-scroll {
  scrollbar-width: auto !important;
  scrollbar-color: auto !important;
}

.visible-scroll::-webkit-scrollbar {
  display: block !important;
}

.issue-panel__editor {
  :deep(.html-editor__container) {
    min-height: 259px;
    height: 259px;

    .tiptap {
      min-height: 259px;
    }
  }
}

.text-caption {
  font-size: 11px;
}

.error-date :deep(.q-field__control:before) {
  border-color: var(--q-negative) !important;
}
.error-date :deep(.q-field__control:hover:before) {
  border-color: var(--q-negative) !important;
}
.error-date :deep(.q-field__control--focused:before) {
  border-color: var(--q-negative) !important;
}

.content-container {
  flex: 1;
  min-height: 0;
  overflow: visible;
}

.tasks-wrapper {
  flex: 1;
  min-height: 0;
}

.issues-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.root-scroll {
  overflow-y: auto;
  min-height: 0;
}
</style>
