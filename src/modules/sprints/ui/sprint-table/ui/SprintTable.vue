<template>
  <q-card flat container>
    <q-table
      flat
      bordered
      :rows="flattenedRows"
      :columns="columns"
      row-key="id"
      :rows-per-page-options="[0]"
      hide-bottom
    >
      <template v-slot:body="props">
        <!-- Спринт -->
        <q-tr v-if="props.row.type === 'sprint'">
          <q-td colspan="100%">
            <div class="row items-center">
              <q-btn
                flat
                dense
                round
                icon="keyboard_arrow_down"
                :class="{ 'rotate-180': props.row.expanded }"
                @click="toggleExpand(props.row)"
              />
              <span class="q-ml-sm text-bold">
                {{ props.row.name }} ({{ formatDate(props.row.startDate) }} -
                {{ formatDate(props.row.endDate) }})
              </span>
              <q-linear-progress
                :value="props.row.progress"
                color="green"
                class="q-ml-md"
                style="width: 200px"
              />
            </div>
          </q-td>
        </q-tr>

        <!-- Задача -->
        <q-tr v-else-if="props.row.type === 'task' && props.row.parentExpanded">
          <q-td>{{ props.row.name }}</q-td>
          <q-td>
            <q-badge
              :color="getStatusColor(props.row.status)"
              :label="props.row.status"
            />
          </q-td>
          <q-td>
            <q-badge
              :color="getPriorityColor(props.row.priority)"
              :label="props.row.priority"
            />
          </q-td>
          <q-td>
            <q-badge
              v-for="tag in props.row.tags"
              :key="tag"
              color="primary"
              class="q-mr-xs"
              :label="tag"
            />
          </q-td>
          <q-td>
            <q-avatar
              v-for="assignee in props.row.assignees"
              :key="assignee"
              size="24px"
              class="q-mr-xs"
            >
              <img :src="assignee" alt="User" />
            </q-avatar>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ISprintRow, IIssueRow } from '../types';
import { formatDate } from '../../../../../utils/time';

const props = defineProps<{
  sprints: ISprintRow[];
}>();

const sprints = ref(props.sprints);

const flattenedRows = computed(() => {
  return sprints.value.flatMap((sprint) => {
    const rows: (ISprintRow | (IIssueRow & { parentExpanded: boolean }))[] = [
      sprint,
    ];

    if (sprint.expanded) {
      rows.push(
        ...sprint.issues.map((issue) => ({
          ...issue,
          parentExpanded: sprint.expanded,
        })),
      );
    }

    return rows;
  });
});

const columns = [
  { name: 'name', label: 'Задача', field: 'name' },
  { name: 'status', label: 'Статус', field: 'status' },
  { name: 'priority', label: 'Приоритет', field: 'priority' },
  { name: 'tags', label: 'Теги', field: 'tags' },
  { name: 'assignees', label: 'Исполнители', field: 'assignees' },
];

function toggleExpand(sprint: ISprintRow) {
  sprint.expanded = !sprint.expanded;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Открыта':
      return 'grey';
    case 'В работе':
      return 'blue';
    case 'Выполнена':
      return 'green';
    case 'Отменена':
      return 'red';
    default:
      return 'grey';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Низкий':
      return 'grey';
    case 'Средний':
      return 'blue';
    case 'Высокий':
      return 'orange';
    case 'Критический':
      return 'red';
    default:
      return 'grey';
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
