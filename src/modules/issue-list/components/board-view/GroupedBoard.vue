<template>
  <div class="horizontal-scroll-enable board-wrapper">
    <div v-for="(table, index) in issues" :key="index">
      <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
        аыаыаыаыва
      </q-item>

      <q-expansion-item
        class="board-item"
        v-if="table.issues?.length"
        :default-opened="
          !projectStore.isGroupHide(table?.entity?.id || table.entity)
        "
        @update:model-value="
          (value) =>
            projectStore.setGroupHide(entity?.entity?.id || table.entity, value)
        "
      >
        <template #header>
          <div>
            <GroupedHeader
              :entity="table?.entity"
              :group-by="groupBy"
              :badge-name="defineEntityName(table.entity, groupBy)"
              :badge-color="table.entity?.color ?? undefined"
              :issues-count="table?.count"
            />

            <PaginationDefault
              v-model:selected-page="quasarPagination.page"
              v-model:rows-per-page="quasarPagination.rowsPerPage"
              :rows-per-page-options="[10, 25, 50, 100]"
              :rows-number="quasarPagination.rowsNumber"
              show-rows-per-page
              @request="getIssues()"
            />
          </div>
        </template>
        <div class="board-card-list scrollable-content">
          <div v-for="card in table.issues" :key="card.id">
            <BoardCard :card="card" />
            <div></div>
          </div>
        </div>
      </q-expansion-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProjectStore } from 'src/stores/project-store';
import { defineEntityName } from '../../utils/defineEntityName';
import GroupedHeader from '../ui/GroupedHeader.vue';
import IssueTable from '../IssueTable.vue';
import { storeToRefs } from 'pinia';
import { formatDateTime } from 'src/utils/time';
import BoardCard from './BoardCard.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import { ref } from 'vue';
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

defineProps<{
  issues: [];
  groupBy: string;
}>();

const emits = defineEmits(['refreshTable', 'refresh']);

const projectStore = useProjectStore();
const { projectProps } = storeToRefs(projectStore);

const refreshTable = (index, entity, pagination) => {
  emits('refreshTable', index, entity, pagination);
};

const quasarPagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: props.rowsCount || 0,
  sortBy: projectProps.value?.filters?.order_by || 'sequence_id',
  descending: projectProps.value?.filters?.orderDesc || true,
  rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
});

// преобразуем quasar пагинацию в пагинацию бека
function parsePagination(pagination: QuasarPagination) {
  return {
    only_count: false,
    show_sub_issue: projectProps.value.showSubIssues ?? true,
    draft: projectProps.value?.draft ?? true,
    order_by: pagination.sortBy,
    desc: pagination.descending,
    offset:
      (pagination.page - 1) *
      (pagination.rowsPerPage == 0 ? 10 : pagination.rowsPerPage),
    limit:
      pagination.rowsPerPage == 0
        ? pagination.rowsNumber || 10
        : pagination.rowsPerPage,
  };
}
interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

const getIssues = async (p?: any) => {
  if (p) quasarPagination.value = p;
  emits('refresh', parsePagination(quasarPagination.value));
};
</script>

<style scoped lang="scss">
.board-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  gap: 12px;
  max-height: calc(100vh - 120px);
  padding: 8px;
  overflow-y: hidden;
}

.all-boards {
  position: relative;
}

.board-item {
  width: 400px;

  :deep(.q-item) {
    border-radius: 16px;
    border: 1px solid var(--darkest-border-color);
  }
}

.board-card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  overflow-y: scroll;
  height: calc(100vh - 200px);
}

.board-card {
  border-radius: 16px;
  border: 1px solid var(--darkest-border-color);
  min-height: 240px;
  padding: 8px;

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
