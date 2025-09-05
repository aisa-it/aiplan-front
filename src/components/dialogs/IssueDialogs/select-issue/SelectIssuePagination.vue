<template>
  <div class="q-ma-sm issues-pagination-indicator">
    <PaginationDefault
      v-if="pagination.rowsNumber"
      v-model:selected-page="pagination.page"
      @update:selected-page="emits('update:pagination', pagination)"
      :rows-number="pagination.rowsNumber"
    />
  </div>
</template>
<script setup lang="ts">
// core
import { inject, onMounted, onUnmounted, reactive } from 'vue';
import { EventBus } from 'quasar';
// components
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

// interfaces
import {
  IIssueResponseData,
  IQuasarPaginationValues,
} from 'src/interfaces/issues';

const emits = defineEmits<{
  'update:pagination': [params: IQuasarPaginationValues];
}>();
const bus = inject('bus') as EventBus;

const pagination = reactive<IQuasarPaginationValues>({
  sortBy: 'sequence_id',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const onUpdateData = (data: IIssueResponseData) => {
  pagination.rowsPerPage = data.limit;
  pagination.rowsNumber = data.count;
};

onMounted(() => {
  emits('update:pagination', pagination);
  bus.on('updateSelectIssue', onUpdateData);
});

onUnmounted(() => {
  bus.off('updateSelectIssue', onUpdateData);
});
</script>
<style scoped lang="scss">
.issues-pagination-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
