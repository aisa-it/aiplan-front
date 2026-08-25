<template>
  <div>
    <hr />
    <div
      class="pt-2 flex justify-end items-center gap-2 max-md:flex-col max-md:content-center"
    >
      <v-pagination
        :model-value="selectedPage"
        :length="pagesCount"
        :total-visible="maxPages"
        density="compact"
        rounded="sm"
        @update:model-value="updateSelectedPage"
        @click.stop
      />

      <div
        v-if="showRowsPerPage"
        class="flex items-center gap-4 whitespace-nowrap"
      >
        <span>{{ labelRowsPerPage }}</span>

        <v-select
          class="mb-2"
          :model-value="rowsPerPage"
          :items="rowsPerPageOptions"
          :aria-label="labelRowsPerPage"
          density="compact"
          hide-details
          variant="plain"
          @update:model-value="updateRowsPerPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    selectedPage?: number;
    rowsPerPage?: number;
    rowsNumber?: number;
    maxPages?: number;
    rowsPerPageOptions?: readonly number[];
    showRowsPerPage?: boolean;
    labelRowsPerPage?: string;
  }>(),
  {
    selectedPage: 1,
    rowsPerPage: 10,
    rowsNumber: 10,
    maxPages: 6,
    rowsPerPageOptions: () => [10, 25, 50, 100],
    showRowsPerPage: true,
    labelRowsPerPage: 'Строк на странице:',
  },
);

const emit = defineEmits<{
  'update:selectedPage': [value: number];
  'update:rowsPerPage': [value: number];
  request: [options: { page: number; rowsPerPage?: number }, source: string];
}>();

const pagesCount = computed(() =>
  props.rowsPerPage > 0
    ? Math.max(1, Math.ceil(props.rowsNumber / props.rowsPerPage))
    : 1,
);

const updateSelectedPage = (value: number) => {
  emit('update:selectedPage', value);
  emit('request', { page: value }, 'selectedPage');
};

const updateRowsPerPage = (value: number) => {
  emit('update:rowsPerPage', value);
  emit('update:selectedPage', 1);
  emit('request', { page: 1, rowsPerPage: value }, 'rowsPerPage');
};
</script>
