<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="slug"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
    @row-click="onRowClick"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination }, searchQuery)"
      />
    </template>

    <template v-slot:body-cell-avatar="props">
      <q-td :props="props">
        <AvatarImage
          :rounded="false"
          :image="props.row.logo ? `${props.row.logo}` : ''"
          :text="props.row.name[0]?.toUpperCase()"
          :tooltip="props.row.name"
        ></AvatarImage>
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props"
        ><span v-html="props.row.name_highlighted"></span
      ></q-td>
    </template>

    <template v-slot:body-cell-settings="props">
      <q-td :props="props">
        <SettingsButton
          @click.stop="$router.push(`${props.row.slug}/workspace-settings`)"
        />
      </q-td>
    </template>

    <template v-slot:no-data>
      <div class="column flex-center" style="width: 100%; height: 75vh">
        <DefaultLoader v-if="loading" />

        <div v-if="!loading && !rows.length" class="column flex-center">
          <DocumentIcon :width="56" :height="56" />
          <h6>Нет пространств</h6>
        </div>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { toRefs, watch } from 'vue';

import AvatarImage from 'src/components/AvatarImage.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import DefaultLoader from 'src/components/loaders/DefaultLoader.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import SettingsButton from '../../ui/SettingsButton.vue';

import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { columns } from '../columnConfig';

import { api } from '../services/api';

import { useTableWithPagination } from '../../composables/useTableWithPagination';
import { useTableRowClick } from '../../composables/useTableRowClick';

const props = defineProps<{ searchQuery: string | undefined }>();

const { searchQuery } = toRefs(props);

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoWorkspaceWithCount>(api.getWorkspaces);

const { onRowClick } = useTableRowClick();

watch(searchQuery, (newVal) => {
  refresh({ pagination: pagination.value }, newVal);
});
</script>
