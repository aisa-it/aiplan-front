<template>
  <div class="column w-full h-full" style="max-height: 100%; overflow: hidden">
    <div class="col-auto q-mb-lg" style="max-width: 100%">
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
      style="overflow-y: scroll; margin-bottom: 24px; max-width: 100%"
    >
      <div class="col-auto">
        <div class="row q-mb-md centered-horisontally">
          <div class="col centered-horisontally">
            <ObserveIcon />
            <span class="q-ml-sm"> Наблюдатели </span>
          </div>
          <SelectMembers
            v-model="watchers"
            label="Выберите наблюдателя"
            class="col centered-horisontally"
            :default-members="defaultProps?.watchers"
            :refresh-members-func="fetchMembers"
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
      <div
        class="create-sprint-editor-host col-auto q-mb-lg"
        :class="{ 'is-mobile': isMobile }"
      >
        <EditorTipTapV2
          v-model="description"
          :excluded-tabs="[TIPTAP_TABS.drawio]"
          :disableImages="true"
          editor-id="create-sprint-editor"
          style="height: 100%; width: 100%"
        />
      </div>

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

import { useFetchMembers } from 'src/components/selects/composables/useFetchMembers';

import SelectMembers from 'src/components/selects/SelectMembers.vue';
import CreateSprintDateRange from './CreateSprintDateRange.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import { TIPTAP_TABS } from 'src/constants/tiptap';
import SelectSprintIssues from './SelectSprintIssues.vue';

import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import WatchDashedIcon from 'src/components/icons/WatchDashedIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import {
  DtoIssueLight,
  DtoSprint,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Member } from 'src/components/selects/types/types';

const props = defineProps<{
  issues?: DtoIssueLight[];
  defaultProps?: DtoSprint | null;
  isMobile?: boolean;
}>();

const emit = defineEmits<{
  delete: [id: string];
  create: [data: any];
  edit: [data: any];
}>();

const { fetchMembers } = useFetchMembers('workspace');

const nameRef = ref();

const sprintName = ref(props.defaultProps?.name ?? '');
const watchers = ref<Member[]>([]);

const dateRange = ref({
  from: props.defaultProps?.start_date
    ? dayjs.utc(props.defaultProps.start_date).format('DD.MM.YYYY')
    : dayjs.utc().format('DD.MM.YYYY'),

  to: props.defaultProps?.end_date
    ? dayjs.utc(props.defaultProps.end_date).format('DD.MM.YYYY')
    : dayjs.utc().add(7, 'day').format('DD.MM.YYYY'),
});

const dateError = computed(() => {
  const from = toISO(dateRange.value.from);
  const to = toISO(dateRange.value.to);

  if (!dateRange.value.from || !dateRange.value.to || !from || !to) {
    return 'Необходимо ввести корректные даты начала и конца спринта';
  }

  const start = dayjs(from);
  const end = dayjs(to);

  if (!start.isBefore(end)) {
    return 'Дата начала должна быть раньше даты конца спринта';
  }

  return '';
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
  const watchersIds = watchers.value.map((el) => el.member?.id);

  if (!props.defaultProps?.watchers || !props.defaultProps?.watchers.length) {
    return {
      add: watchersIds,
      remove: [],
    };
  }

  if (!watchersIds) return { remove: [], add: [] };

  const remove =
    props.defaultProps?.watchers?.filter(
      (el) => !watchersIds.some((i) => i === el.id),
    ) ?? [];

  const add =
    watchersIds.filter((el) => !remove?.some((del) => del.id === el)) ?? [];

  return {
    remove: remove.map((el) => el.id),
    add: add,
  };
};

const pushData = () => {
  const isValidName = nameRef.value.validate();

  if (!isValidName || dateError.value) {
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
    watchers.value = [];

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

.create-sprint-editor-host {
  height: 312px;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.html-editor) {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    height: 100%;
  }

  :deep(.html-editor__outer) {
    flex: 1 1 0;
    min-height: 0;
    min-width: 0;
  }

  :deep(.html-editor__wrapper) {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.html-editor__container) {
    flex: 1 1 0;
    min-height: 0 !important;
    height: auto !important;
    max-height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .tiptap {
      flex: 1 1 0;
      min-height: 0 !important;
      height: auto !important;
      width: 100%;
      overflow-y: auto;
    }
  }

  &.is-mobile {
    :deep(.html-editor__outer) {
      max-width: calc(100% - 47px);
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
