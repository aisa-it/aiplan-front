<template>
  <q-table
    flat
    row-key="id"
    :loading="loading"
    loading-label="Загружается..."
    no-data-label="Нет данных"
    :rows="rows"
    :columns="columns"
    hide-pagination
    class="table-bottom-reverse"
  >
    <template v-slot:body-cell-body="props">
      <q-td :props="props" class="description-cell">
        <ShowButton @click.stop="$emit('show', props.row)" />
      </q-td>
    </template>

    <template v-slot:body-cell-settings="props">
      <q-td :props="props">
        <template v-if="version === props.row?.tag_name">
          <EditButton @click.stop="$emit('edit', props.row)" />
          <DeleteButtonBinIcon @click.stop="$emit('delete', props.row)" />
        </template>
      </q-td>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import ShowButton from '../ui/ShowButton.vue';
import EditButton from '../ui/EditButton.vue';
import DeleteButtonBinIcon from '../ui/DeleteButtonBinIcon.vue';

import { columns } from '../columnConfig';

import { useVersion } from '../composables/useVersion';
import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const { version } = useVersion();

defineProps<{
  rows: DtoReleaseNoteLight[];
  loading: boolean;
}>();

defineEmits<{
  edit: [row: DtoReleaseNoteLight];
  delete: [row: DtoReleaseNoteLight];
  show: [row: DtoReleaseNoteLight];
}>();
</script>

<style scoped lang="scss">
.description-cell {
  max-width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

:deep(td) {
  border-bottom-width: 1px;
}
</style>
