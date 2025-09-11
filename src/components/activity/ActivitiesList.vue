<template>
  <q-table
    flat
    class="q-my-md q-px-none activities-table table-bottom-reverse"
    :columns="columns"
    :rows="rows"
    row-key="activity"
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
      <ActivityBlock :activityRow="props.row" :only-project="onlyProject" :only-workspace="onlyWorkspace"/>
    </template>
  </q-table>
</template>
<script lang="ts">
// core
import { defineComponent, onMounted, ref, watch } from 'vue';

// components
import ActivityBlock from 'src/components/activity/ActivityBlock.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import dayjs from 'dayjs';

export default defineComponent({
  name: 'ActivitiesList',
  computed: {
    dayjs() {
      return dayjs;
    },
  },
  props: ['rows', 'rowsCount', 'currentDay', 'onlyProject', 'onlyWorkspace'],
  emits: ['update', 'onCloseClick'],
  setup(props, { emit }) {
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
      emit('update', option);
      pagination.value = { ...option.pagination };
    };

    const onCloseClick = () => {
      console.log('onCloseClick');
      emit('onCloseClick');
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

    return {
      columns,
      pagination,
      onUpdate,
      onCloseClick,
    };
  },
  components: { ActivityBlock, PaginationDefault },
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
