<template>
  <div
    class="h-full overflow-hidden bg-[rgb(var(--v-theme-background))]"
    role="status"
    aria-label="Загрузка задач"
    aria-busy="true"
  >
    <div
      class="w-max animate-pulse motion-reduce:animate-none"
      aria-hidden="true"
    >
      <div
        v-for="row in rowCount + 1"
        :key="row"
        class="grid border-b border-[rgba(var(--v-theme-on-background),0.12)]"
        :class="row === 1 ? 'h-12' : 'h-14'"
        :style="{ gridTemplateColumns }"
      >
        <div
          v-for="(column, index) in columns"
          :key="column.key"
          class="flex items-center px-4"
        >
          <v-skeleton-loader
            type="text"
            boilerplate
            color="transparent"
            class="flex-1"
            :max-width="
              row === 1 ? 110 : skeletonWidths[index % skeletonWidths.length]
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ISSUE_TABLE_COLUMNS,
  type IssueTableColumn,
} from '../constants/issue-table-columns';

const props = withDefaults(
  defineProps<{
    columns?: Pick<IssueTableColumn, 'key' | 'width'>[];
    rowCount?: number;
  }>(),
  {
    columns: () => Object.values(ISSUE_TABLE_COLUMNS),
    rowCount: 15,
  },
);

const skeletonWidths = [85, 50, 35, 65, 25, 85];
const gridTemplateColumns = computed(() =>
  props.columns.map((column) => `${column.width}px`).join(' '),
);
</script>
