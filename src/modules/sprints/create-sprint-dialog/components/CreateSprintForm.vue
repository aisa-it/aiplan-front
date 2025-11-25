<template>
  <div class="column w-full h-full" style="max-height: 100%; overflow: hidden">
    <div class="col-auto q-mb-lg">
      <q-input
        v-model="sprintName"
        class="q-mb-sm base-input q-pa-none"
        label="Название спринта"
        :rules="[(val) => !!val || 'Введите название спринта']"
        dense
      />
    </div>
    <div class="col column no-wrap" style="overflow-y: scroll">
      <div class="col-auto">
        <div class="row q-mb-md centered-horisontally">
          <div class="col centered-horisontally issue-selector-label">
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

        <div class="row q-mb-md centered-horisontally">
          <div class="col centered-horisontally issue-selector-label">
            <WatchDashedIcon />
            <span class="q-ml-sm"> Интервал </span>
          </div>
          <CreateSprintDateRange class="col" v-model="dateRange" />
        </div>
      </div>

      <p class="q-mb-md">Цель спринта:</p>
      <EditorTipTapV2
        v-model="description"
        editor-id="create-sprint-editor"
        class="col-auto q-mb-lg"
        style="height: 312px"
      />

      <div class="flex column no-wrap q-mb-lg">
        <div class="centered-horisontally q-mb-sm">
          <LinkIcon />
          <span class="q-ml-sm">Задачи</span>
        </div>

        <SelectSprintIssues
          v-if="issues && issues.length > 0"
          :issues="issues"
          @delete="(id) => emit('delete', id)"
          class="q-pr-lg visible-scroll"
          style="overflow-y: auto; max-height: 216px; scrollbar-width: auto"
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
import { ref, watch } from 'vue';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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

const sprintName = ref(props.defaultProps?.name ?? '');
const watchers = ref<any>(
  props.defaultProps?.watchers?.map((el) => {
    return { id: el.id, member: el };
  }) ?? [],
);

const dateRange = ref({
  from: props.defaultProps?.start_date
    ? dayjs.utc(props.defaultProps.start_date).format('DD.MM.YYYY')
    : dayjs().format('DD.MM.YYYY'),

  to: props.defaultProps?.end_date
    ? dayjs.utc(props.defaultProps.end_date).format('DD.MM.YYYY')
    : dayjs().add(7, 'day').format('DD.MM.YYYY'),
});

const description = ref(props.defaultProps?.description ?? '');

const toISO = (data: string) => {
  const parsed = dayjs(data, 'DD.MM.YYYY', true);

  if (!parsed.isValid()) return null;

  return dayjs
    .utc()
    .set('year', parsed.year())
    .set('month', parsed.month())
    .set('date', parsed.date())
    .startOf('day')
    .toISOString();
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
      add: watchers.value.map((el) => el.member.id),
      remove: [],
    };
  }

  if (!watchers.value) return { remove: [], add: [] };

  const remove =
    props.defaultProps?.watchers?.filter(
      (el) => !watchers.value.some((i) => i.member.id === el.id),
    ) ?? [];

  const add =
    watchers.value.filter(
      (el) => !remove?.some((del) => del.id === el.member.id),
    ) ?? [];

  return {
    remove: remove.map((el) => el.id),
    add: add.map((el) => el.member.id),
  };
};

const pushData = () => {
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
    sprintName.value = props.defaultProps?.name ?? '';
    watchers.value =
      props.defaultProps?.watchers?.map((el) => {
        return { id: el.id, member: el };
      }) ?? [];

    dateRange.value = {
      from: props.defaultProps?.start_date
        ? dayjs(props.defaultProps.start_date).format('DD.MM.YYYY')
        : dayjs().format('DD.MM.YYYY'),

      to: props.defaultProps?.end_date
        ? dayjs(props.defaultProps.end_date).format('DD.MM.YYYY')
        : dayjs().add(7, 'day').format('DD.MM.YYYY'),
    };

    description.value = props.defaultProps?.description ?? '';
  },
);
</script>

<style scoped>
.visible-scroll {
  scrollbar-width: auto !important;
  scrollbar-color: auto !important;
}

.visible-scroll::-webkit-scrollbar {
  display: block !important;
}
</style>
