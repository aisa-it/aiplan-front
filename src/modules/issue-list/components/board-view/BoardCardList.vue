<template>
  <q-expansion-item
    v-if="table.issues?.length"
    class="board-item"
    hide-expand-icon
    :default-opened="
      !projectStore.isGroupHide(table?.entity?.id || table.entity)
    "
    @update:model-value="
      (value) => toggleList(table?.entity?.id || table.entity, value)
    "
  >
    <template #header>
      <div class="board-list-header">
        <div class="toggle-line">
          <GroupedHeader
            :entity="table?.entity"
            :group-by="groupBy"
            :badge-name="defineEntityName(table.entity, groupBy)"
            :badge-color="table.entity?.color ?? undefined"
            :issues-count="table?.count"
          />
          <ArrowUp
            :class="{
              'rotate-180': isExpanded,
              'arrow-up': true,
            }"
          />
        </div>

        <PaginationDefault
          v-show="!isExpanded && quasarPagination.rowsNumber / 25 > 1"
          v-model:selected-page="quasarPagination.page"
          :rows-number="quasarPagination.rowsNumber"
          :rows-per-page="25"
          :max-pages="3"
          class="issues-single-board__pagination pagination-line"
          @update:selectedPage="(page) => getIssues(page)"
          @click.stop.prevent
        />
      </div>
    </template>

    <div class="board-card-list scrollable-content">
      <div v-for="card in table.issues" :key="card.id">
        <BoardCard
          :card="card"
          @refresh="(isFullUpdate) => getIssues(quasarPagination, isFullUpdate)"
        />
      </div>
    </div>
  </q-expansion-item>

  <q-item v-else class="empty-board-item">
    <div class="board-list-header">
      <GroupedHeader
        :entity="table?.entity"
        :group-by="groupBy"
        :badge-name="defineEntityName(table.entity, groupBy)"
        :badge-color="table.entity?.color ?? undefined"
        :issues-count="table?.count"
      />
    </div>
  </q-item>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';

import BoardCard from './BoardCard.vue';

import { defineEntityName } from '../../utils/defineEntityName';

import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

import GroupedHeader from '../ui/GroupedHeader.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

import {
  QuasarPagination,
  useGroupedIssues,
} from '../../composables/useGroupedIssues';
import ArrowUp from 'src/components/icons/ArrowUp.vue';

const { parsePagination } = useGroupedIssues();

const projectStore = useProjectStore();

const { projectProps } = storeToRefs(projectStore);

const emits = defineEmits(['refresh']);
const props = defineProps<{ table: any; groupBy: string }>();

const selectedPage = ref(1);
const isExpanded = ref(false);
const quasarPagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: props.table.count || 0,
  sortBy: projectProps.value?.filters?.order_by || 'sequence_id',
  descending: projectProps.value?.filters?.orderDesc || true,
  rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
});

const getIssues = async (p?: any, isFullUpdate = false) => {
  quasarPagination.value.page = await p;

  emits('refresh', parsePagination(quasarPagination.value), isFullUpdate);
};

const toggleList = async (entity, value) => {
  isExpanded.value = !value;
  await projectStore.setGroupHide(entity, value);
};

onMounted(() => {
  isExpanded.value = projectStore.isGroupHide(
    props?.table?.entity?.id || props?.table?.entity,
  );
});
</script>

<style scoped lang="scss">
.empty-board-item {
  width: 400px;
  border-radius: 16px;
  border: 1px solid var(--darkest-border-color);
}
.board-card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  overflow-y: scroll;
  height: calc(100vh - 250px);
}
.board-item {
  width: 400px;

  :deep(.q-item) {
    border-radius: 16px;
    border: 1px solid var(--darkest-border-color);
  }
}
.board-list-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.toggle-line {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
}

.pagination-line {
  align-self: center;
}
</style>
