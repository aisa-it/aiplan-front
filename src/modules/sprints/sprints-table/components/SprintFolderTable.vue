<template>
  <div class="folder-table-wrapper" ref="wrapper">
    <q-table
      ref="folderTable"
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      binary-state-sort
      flat
      class="my-sticky-column-table"
      @row-click="(_, row) => handleClick(row)"
      @row-contextmenu.prevent="onRowContextMenu"
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
  </div>

  <SprintContextMenu
    :row="contextRow"
    :anchor-event="contextEvent"
    @refresh="emits('refresh')"
    />
</template>

<script lang="ts" setup>
import {
  ref,
} from 'vue';
import { QTable } from 'quasar';

import SprintContextMenu from 'src/modules/sprints/sprints-table/components/SprintContextMenu.vue';

import StatusLinearProgressBar from 'src/components/progress-bars/StatusLinearProgressBar.vue';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store.ts';
import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const sprintStore = useSprintStore();

const emits = defineEmits([
  'refresh',
]);
const props = defineProps([
  'rows',
  'columns',
]);


const contextRow = ref(null);
const contextEvent = ref<MouseEvent | null>(null);

const onRowContextMenu = (evt, row) => {
  contextRow.value = row;
  contextEvent.value = evt;
};

const handleClick = (row: DtoSprintLight) => {
    sprintStore.openSprint(row.id as string, '_blank');
};
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
:deep(.q-table__middle) {
  overflow-x: hidden;
}

.folder-table-wrapper {
  position: relative;
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
