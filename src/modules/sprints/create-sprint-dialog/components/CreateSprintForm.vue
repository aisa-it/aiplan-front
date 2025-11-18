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
      label="Создать спринт"
      flat
      dense
      no-caps
      class="primary-btn"
      style="width: 100%"
      @click="createSprint"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

const props = defineProps<{
  issues?: any[];
}>();

const emit = defineEmits<{
  (event: 'delete', id: string): void;
  (event: 'create', data: any): void;
}>();

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

const sprintName = ref('');
const watchers = ref<any>([]);

const dateRange = ref({
  from: dayjs().format('DD.MM.YYYY'),
  to: dayjs().add(7, 'day').format('DD.MM.YYYY'),
});

const description = ref();

const toISO = (data: string) => {
  const parsed = dayjs(data, 'DD.MM.YYYY', true);
  return parsed.isValid() ? parsed.toISOString() : null;
};

const createSprint = () => {
  emit('create', {
    createSprintData: {
      name: sprintName.value,
      description: description.value,
      start_date: toISO(dateRange.value.from),
      end_date: toISO(dateRange.value.to),
    },
    issuesSprint: { issues_add: props.issues?.map((el) => el.id) },
    membersSprint: { members_add: watchers.value.map((el) => el.id) },
  });
};
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
