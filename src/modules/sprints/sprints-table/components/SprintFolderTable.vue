<template>
  <div class="folder-table-wrapper" ref="wrapper">
    <q-table
      ref="folderTable"
      :rows="rows"
      :row-key="id"
      :columns="columns"
      binary-state-sort
      flat
      class="my-sticky-column-table table-bottom-reverse hide-native-bottom"
      @row-click="(_, row) => handleClick(row)"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in columns"
            :key="col.name"
            :props="props"
            :class="`${col.name.includes('count') ? 'count-column' : ''} ${col.name}-column`"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template #bottom> </template>

      <template v-slot:body-cell-stats="props">
        <q-td>
          <StatusLinearProgressBar :stats="props.row.stats" />
        </q-td>
      </template>
    </q-table>

    <div class="sticky-bottom">
      <div class="table-h-scroll" ref="hScroll">
        <div class="table-h-scroll__content" />
      </div>
    </div>
  </div>

  <!-- <IssueContextMenu
    :row="contextRow"
    :anchor-event="contextEvent"
    @refresh="refreshTable"
  /> -->
</template>

<script lang="ts" setup>
import {
  inject,
  ref,
  watch,
  watchEffect,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import { EventBus, QTable } from 'quasar';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';

import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';

import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';
import SequenceId from 'src/modules/issue-list/components/board-view-ui/SequenceId.vue';
import StatusLinearProgressBar from 'src/components/progress-bars/StatusLinearProgressBar.vue';
import { useUserStore } from 'src/stores/user-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store.ts';

const sprintStore = useSprintStore();
const { user } = storeToRefs(useUserStore());

const emits = defineEmits([
  'refresh',
  'updateIssueField',
  'openSprint',
  'updateGroupedIssues',
]);
const props = defineProps([
  'entity',
  'rows',
  'rowsCount',
  'loading',
  'columns',
  'contextType',
]);

// const { updateCurrentTable } = useGroupedIssues(props.contextType);

const bus = inject('bus') as EventBus;

const contextRow = ref(null);
const contextEvent = ref<MouseEvent | null>(null);

// const onRowContextMenu = (evt, row) => {
//   contextRow.value = row;
//   contextEvent.value = evt;
// };

const loadingTable = ref(false);

const handleClick = (row) => {
    const target = user.value?.theme?.open_in_new ? '_blank' : '_self';
    sprintStore.openSprint(row.id, target);
};

const issueTable = ref<InstanceType<typeof QTable> | null>(null);
const hScroll = ref<HTMLElement | null>(null);
let middle: HTMLElement | null = null;

const getMiddle = () =>
  issueTable.value?.$el.querySelector('.q-table__middle') as HTMLElement;

const updateWidth = () => {
  const middle = getMiddle();
  const table = middle?.querySelector('table');

  if (!middle || !table || !hScroll.value) return;

  const tableWidth = table.scrollWidth;
  const containerWidth = middle.clientWidth;

  hScroll.value.firstElementChild!.style.width = tableWidth + 'px';

  hScroll.value.style.display = tableWidth > containerWidth ? 'block' : 'none';
};

watch(
  () => props.rows,
  () => {
    loadingTable.value = false;
  },
);
</script>

<style lang="scss">
th.count-column {
  min-width: 95px;
  max-width: 95px;
  padding-right: 0;
}

.my-sticky-column-table {
  thead tr:first-child th:first-child {
    background: $bg-surface;
    position: sticky;
    left: 0;
    z-index: 100;
  }

  td {
    font-size: 1em !important;

    &:first-child {
      background: $bg-surface;
      border-right: 2px solid $color-shadow;
      position: sticky;
      left: 0;
      z-index: 100;
    }
  }

  .q-linear-progress {
    position: absolute !important;
    width: 100% !important;
    overflow: hidden !important;
    font-size: 4px !important;
    height: 1px !important;
    color: var(--q-primary) !important;
    transform: scale3d(1, 1, 1) !important;
    border: 0px;
    z-index: 101;
    background-color: $color-shadow !important;
  }

  .name-column {
    width: 400px;
    max-width: 400px;
    min-width: 400px;

    @media screen and (max-width: 1920px) {
      width: 300px;
      max-width: 300px;
      min-width: 300px;
    }

    @media screen and (max-width: 1200px) {
      width: 250px;
      max-width: 250px;
      min-width: 250px;
    }

    @media screen and (max-width: 600px) {
      width: 200px;
      max-width: 200px;
      min-width: 200px;
    }
  }
}
</style>

<style lang="scss" scoped>
// :deep(.hide-native-bottom .q-table__bottom) {
//   min-height: auto;
//   height: 0 !important;
//   padding: 0 !important;
// }

:deep(.q-table__middle) {
  overflow-x: hidden;
}

.folder-table-wrapper {
  position: relative;
}

.pagination-wrapper {
  display: flex;
  justify-content: end;
}

.sticky-bottom {
  position: sticky;
  bottom: 0;
  z-index: 200;
  background: $bg-color;
}

.table-h-scroll {
  height: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  opacity: 0;
  transition: opacity 0.15s;
}

.folder-table-wrapper:hover .table-h-scroll {
  opacity: 1;
}

@media (pointer: coarse) {
  :deep(.q-table__middle) {
    overflow-x: auto;
  }

  .table-h-scroll {
    display: none !important;
  }
}
</style>
