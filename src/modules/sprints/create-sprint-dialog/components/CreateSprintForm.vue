<template>
  <div class="column w-full h-full" style="max-height: 100%; overflow: hidden">
    <div class="col-auto">
      <q-input
        v-model="sprintName"
        class="q-mb-sm base-input"
        label="Название спринта"
        :rules="[(val) => !!val || 'Введите название спринта']"
        dense
      />
    </div>
    <div class="col column no-wrap" style="overflow-y: scroll">
      <div class="col-auto">
        <div class="row q-mb-sm centered-horisontally">
          <div class="col centered-horisontally issue-selector-label">
            <ObserveIcon />
            <span class="q-ml-sm"> Наблюдатель </span>
          </div>
          <ObserveIcon class="issue-selector-icon mr-12" />

          <SelectWatchers
            v-model:watchers="watchers"
            :projectid="project.id"
            :current-member="user"
            label="Выберите наблюдателя"
            class="col centered-horisontally"
          />
        </div>

        <div class="row q-mb-sm centered-horisontally">
          <div class="col centered-horisontally issue-selector-label">
            <WatchDashedIcon />
            <span class="q-ml-sm"> Интервал </span>
          </div>
          <WatchDashedIcon class="issue-selector-icon mr-12" />
          <CreateSprintDateRange class="col" v-model="dateRange" />
        </div>
      </div>

      <EditorTipTapV2
        v-model="editorValue"
        editor-id="aidoc-editor"
        class="col-auto"
      />

      <div class="flex column no-wrap q-mt-sm">
        <div class="centered-horisontally">
          <LinkIcon />
          <span class="q-ml-sm">Задачи</span>
        </div>

        <SelectSprintIssues
          v-if="issues && issues.length > 0"
          v-model="checkedIssues"
          :issues="
            issues.map((i) => {
              return {
                id: i.id,
                name: i.name,
              };
            })
          "
          class="scrollable-content"
          style="overflow-y: auto"
        />
      </div>
    </div>

    <div class="col-auto flex q-mt-sm justify-end">
      <q-btn label="Создать спринт" color="primary" @click="createSprint" />
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import WatchDashedIcon from 'src/components/icons/WatchDashedIcon.vue';
import SelectWatchers from 'src/components/selects/SelectWatchers.vue';
import { useUserStore } from 'src/stores/user-store';
import { computed, ref } from 'vue';
import CreateSprintDateRange from './CreateSprintDateRange.vue';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
import SelectSprintIssues from './SelectSprintIssues.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';

const props = defineProps<{
  issues: any[];
}>();

const emit = defineEmits<{
  (event: 'update:issues', checkedRows: any[]): void;
}>();

//stores
const userStore = useUserStore();

//storesToRefs
const { user } = storeToRefs(userStore);

//state
const sprintName = ref('');
const watchers = ref([]);
const project = ref([]);
const dateRange = ref<{ from: string; to: string }>({
  from: dayjs(new Date()).format('DD/MM/YYYY'),
  to: dayjs(new Date()).add(7, 'day').format('DD/MM/YYYY'),
});
const description = ref('');
const editorValue = ref('');
const checkedIssues = ref<string[]>([]);

//computeds
const issues = computed({
  get: () => props.issues,
  set: (val) => emit('update:issues', val),
});

//methods
const createSprint = () => {
  console.log({
    sprintName: sprintName.value,
    watchers: watchers.value,
    dateRange: dateRange.value,
    description: description.value,
    issues: checkedIssues.value,
  });
};
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: auto;
}
</style>
