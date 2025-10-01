<template>
  <div class="horizontal-scroll-enable board-wrapper">
    <div v-for="(table, index) in issues" :key="index">
      <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
        аыаыаыаыва
      </q-item>

      <BoardCardList
        :table="table"
        :group-by="groupBy"
        @refresh="(pagination) => refreshTable(index, table.entity, pagination)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';

import BoardCardList from './BoardCardList.vue';

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
