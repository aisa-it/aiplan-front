<template>
  <q-card flat container class="q-pa-md row">
    <q-card-section
      v-if="false"
      class="col q-pa-none q-mr-md"
      style="margin-top: 36px"
    >
      <SprintTable :sprints="tableRows" />
    </q-card-section>
    <q-card-section v-if="issues.length" class="col q-pa-none">
      <FrappeGantt :sprint="sprint" :issues="issues" :view-mode="'Day'" />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
//cores
import { computed, ref, onMounted, shallowRef } from 'vue';
//types
import { ISprintRow } from '../../sprint-table/types';
//components
import SprintTable from '../../sprint-table/ui/SprintTable.vue';
import FrappeGantt from './components/gantt-chart/ui/frappe-gantt/ui/FrappeGantt.vue';
import { ICustomGanttTask } from './components/gantt-chart/ui/frappe-gantt/types';
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useRoute } from 'vue-router';

const props = defineProps<{
  sprint: DtoSprint;
}>();

const sprintStore = useSprintStore();
const route = useRoute();

const tableRows = ref<ISprintRow[]>([
  {
    id: '1',
    type: 'sprint',
    name: 'Спринт 1',
    startDate: '2025-06-24T00:00:00.000Z',
    endDate: '2025-06-27T00:00:00.000Z',
    progress: 50,
    expanded: true,
    issues: [
      {
        id: '2',
        type: 'task',
        parentId: '1',
        parentExpanded: true,
        name: 'Задача 1',
        startDate: '2025-06-24T00:00:00.000Z',
        endDate: '2025-06-25T00:00:00.000Z',
        progress: 0.2,
        status: 'Открыта',
        priority: 'Низкий',
        tags: ['Ошибка'],
        assignees: ['https://i.pravatar.cc/150?img=1'],
      },
      {
        id: '3',
        type: 'task',
        parentId: '1',
        parentExpanded: true,
        name: 'Задача 2',
        startDate: '2025-06-25T00:00:00.000Z',
        endDate: '2025-06-26T00:00:00.000Z',
        progress: 50,
        status: 'В работе',
        priority: 'Средний',
        tags: ['Дизайн'],
        assignees: [
          'https://i.pravatar.cc/150?img=2',
          'https://i.pravatar.cc/150?img=3',
        ],
      },
      {
        id: '4',
        type: 'task',
        parentId: '1',
        parentExpanded: true,
        name: 'Задача 3',
        startDate: '2025-06-26T00:00:00.000Z',
        endDate: '2025-06-27T00:00:00.000Z',
        progress: 20,
        status: 'Выполнена',
        priority: 'Высокий',
        tags: [],
        assignees: ['https://i.pravatar.cc/150?img=4'],
      },
    ],
  },
  {
    id: '5',
    type: 'sprint',
    name: 'Спринт 2',
    startDate: '2025-07-01T00:00:00.000Z',
    endDate: '2025-07-10T00:00:00.000Z',
    progress: 10,
    expanded: false,
    issues: [
      {
        id: '6',
        type: 'task',
        parentId: '5',
        parentExpanded: false,
        name: 'Задача A',
        startDate: '2025-07-01T00:00:00.000Z',
        endDate: '2025-07-03T00:00:00.000Z',
        progress: 14,
        status: 'Открыта',
        priority: 'Низкий',
        tags: [],
        assignees: ['https://i.pravatar.cc/150?img=5'],
      },
      {
        id: '7',
        type: 'task',
        parentId: '5',
        parentExpanded: false,
        name: 'Задача Б',
        startDate: '2025-07-01T00:00:00.000Z',
        endDate: '2025-07-03T00:00:00.000Z',
        progress: 10,
        status: 'Отменена',
        priority: 'Низкий',
        tags: [],
        assignees: ['https://i.pravatar.cc/150?img=5'],
      },
    ],
  },
]);

const issues = shallowRef<any>([]);

const refresh = async () => {
  issues.value = (
    await sprintStore.getIssueList(
      route.params.workspace as string,
      route.params.sprint as string,
    )
  ).data.issues;
  console.log(issues.value);
};

onMounted(async () => {
  refresh();
});

const ganttTasks = computed<ICustomGanttTask[]>(() => {
  return tableRows.value.flatMap((sprint) => {
    if (!sprint.expanded) {
      return [];
    }

    const sprintTask: ICustomGanttTask = {
      id: sprint.id,
      name: sprint.name,
      start: sprint.startDate,
      end: sprint.endDate,
      progress: sprint.progress,
      status: '',
    };

    const issueTasks: ICustomGanttTask[] = sprint.issues.map(
      (issue, index, arr) => {
        const dependencies = index > 0 ? arr[index - 1].id : '';

        return {
          id: issue.id,
          name: issue.name,
          start: issue.startDate,
          end: issue.endDate,
          progress: issue.progress,
          status: issue.status,
          parentId: sprint.id,
          dependencies: dependencies,
        };
      },
    );

    return [sprintTask, ...issueTasks];
  });
});
</script>
