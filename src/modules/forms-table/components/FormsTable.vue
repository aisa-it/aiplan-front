<template>
  <div>
    <q-input
      v-model="searchQuery"
      class="base-input q-mb-md"
      label="Поиск"
      dense
      clearable
    />

    <q-table
      v-model:pagination="pagination"
      flat
      bordered
      row-key="slug"
      loading-label="Загружается..."
      no-data-label="Нет данных"
      :rows="filteredRows"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50, 100]"
      @row-click="openForm"
    >
      <template #pagination>
        <PaginationDefault
          v-model:selected-page="pagination.page"
          :rows-number="filteredRows.length"
          :rows-per-page="pagination.rowsPerPage"
          :show-rows-per-page="true"
          @update:selectedPage="(value) => (pagination.page = value)"
          @update:rowsPerPage="(value) => (pagination.rowsPerPage = value)"
        />
      </template>

      <template #body-cell-copy_link="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="copyFormLink(props.row)"
          >
            <LinkIcon />
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <EmptyStateTable :loading="loading" title="Нет форм">
          <DocumentIcon :width="56" :height="56" />
        </EmptyStateTable>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';

import { getFormList } from 'src/components/forms/services/api';
import type { IForms } from 'src/interfaces/forms';
import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';

import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import EmptyStateTable from 'src/modules/admin-panel/ui/EmptyStateTable.vue';

const route = useRoute();
const router = useRouter();

const rows = ref<IForms[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const columns: QTableColumn<IForms>[] = [
  {
    name: 'title',
    align: 'left',
    label: 'Название',
    sortable: true,
    field: (row) => row.title ?? '-',
  },
  {
    name: 'slug',
    align: 'left',
    label: 'Идентификатор',
    sortable: true,
    field: (row) => row.slug ?? '-',
  },
  {
    name: 'copy_link',
    align: 'center',
    label: 'Ссылка',
    field: (row) => row,
  },
];

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return rows.value;

  return rows.value.filter((form) =>
    `${form.title ?? ''} ${form.slug ?? ''}`.toLowerCase().includes(query),
  );
});

const refresh = async () => {
  const workspaceSlug = route.params.workspace as string;
  if (!workspaceSlug) return;

  loading.value = true;
  try {
    rows.value = await getFormList(workspaceSlug);
  } finally {
    loading.value = false;
  }
};

const openForm = (_event: Event, form: IForms) => {
  if (!form.slug) return;
  router.push(`/${route.params.workspace}/forms/${form.slug}`);
};

const copyFormLink = (form: IForms) => {
  if (!form.slug) return;
  copyLinkToClipboard('forms', {
    workspaceSlug: route.params.workspace as string,
    formSlug: form.slug,
  });
};

onMounted(refresh);

watch(
  () => route.params.workspace,
  () => {
    refresh();
  },
);
</script>
