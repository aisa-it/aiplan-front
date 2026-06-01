<template>
  <q-table
    flat
    class="q-my-md q-px-none activities-table table-bottom-reverse"
    :columns="columns"
    :rows="rows"
    no-data-label="Нет данных"
    loading-label="Загружается..."
    :rows-per-page-options="[10, 25, 100]"
    v-model:pagination="pagination"
    @request="onUpdate"
    >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="onUpdate({ pagination })"
      />
    </template>
    <template v-slot:header>
      <div class="activity-title q-pr-md q-pl-md">
        <span :class="{ 'text-h6': $q.screen.lt.sm }" class="font-semibold"
          >Активность {{ currentDay ? `${currentDay} г.` : '' }}</span
        >
        <q-btn
          v-if="!!currentDay && currentDay.length"
          icon="close"
          :style="'shadow: none'"
          size="xs"
          @click="onCloseClick"
        />
      </div>
    </template>
    <template v-slot:body-cell-activity="props">
      <ActivityBlock
        :activityRow="props.row"
        :only-project="onlyProject"
        :only-workspace="onlyWorkspace"
      />
    </template>
  </q-table>
</template>
<script setup lang="ts">
// core
import { onMounted, ref, watch } from 'vue';

// components
import ActivityBlock from 'src/components/activity/ActivityBlock.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  rows: DtoEntityActivityFull[];
  rowsCount: number;
  currentDay?: string;
  onlyProject?: boolean;
  onlyWorkspace?: boolean;
}>();

const emits = defineEmits<{
  update: [options: any];
  onCloseClick: [];
}>();

// vars
const columns = [
  {
    name: 'activity',
    label: 'Активность',
    align: 'left',
    field: (row: any) => {
      return row;
    },
  },
];
// TODO sortBy, descending не используются
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const onUpdate = (option?: any) => {
  emits('update', option);
  pagination.value = { ...option.pagination };
};

const onCloseClick = () => {
  emits('onCloseClick');
  pagination.value.page = 1;
};

watch(
  () => props.rowsCount,
  (count) => {
    pagination.value.rowsNumber = count;
  },
);

onMounted(() => {
  onUpdate({ pagination: pagination.value });
});
</script>

<style scoped>
.activity-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  font-weight: 500;
}
</style>
