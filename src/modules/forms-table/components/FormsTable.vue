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
      :columns="formsTableColumns"
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

      <template #body-cell-edit="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="editForm(props.row)"
          >
            <EditIcon />
          </q-btn>
        </q-td>
      </template>

      <template #body-cell-delete="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="askDeleteForm(props.row)"
          >
            <BinIcon />
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <EmptyStateTable :loading="loading" title="Нет форм">
          <DocumentIcon :width="56" :height="56" />
        </EmptyStateTable>
      </template>
    </q-table>

    <FormDialog
      v-model="isFormEditOpen"
      :form-slug="editFormSlug"
      @success-create="refresh"
    />
    <DeleteFormDialog
      v-model="isFormDeleteOpen"
      :form="formToDelete"
      @success-delete="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { getFormList } from 'src/components/forms/services/api';
import { useFormStore } from 'src/stores/form-store';
import type { IForms } from 'src/interfaces/forms';
import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';
import { formsTableColumns } from '../utils/tableColums';

import LinkIcon from 'src/components/icons/LinkIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import EmptyStateTable from 'src/modules/admin-panel/ui/EmptyStateTable.vue';
import FormDialog from 'src/components/forms/dialogs/FormDialog.vue';
import DeleteFormDialog from 'src/components/forms/dialogs/DeleteFormDialog.vue';

const route = useRoute();
const router = useRouter();

const formStore = useFormStore();
const { forms: rows } = storeToRefs(formStore);

const loading = ref(false);
const searchQuery = ref('');
const isFormEditOpen = ref(false);
const isFormDeleteOpen = ref(false);
const editFormSlug = ref<string>();
const formToDelete = ref<IForms>();
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});

const filteredRows = computed(() => {
  const query = searchQuery.value?.trim()?.toLowerCase();
  if (!query) return rows.value;

  return rows.value.filter((form) =>
    `${form.title ?? ''} ${form.slug ?? ''}`.toLowerCase().includes(query),
  );
});

const refresh = async () => {
  const workspaceSlug = route.params.workspace;
  if (!workspaceSlug) return;

  loading.value = true;
  try {
    formStore.forms = await getFormList(workspaceSlug);
  } finally {
    loading.value = false;
  }
};

const openForm = (_event: Event, form: IForms) => {
  if (!form.slug) return;
  router.push(`/${route.params.workspace}/forms/${form.slug}`);
};

const editForm = (form: IForms) => {
  editFormSlug.value = form.slug ?? undefined;
  isFormEditOpen.value = true;
};

const askDeleteForm = (form: IForms) => {
  formToDelete.value = form;
  isFormDeleteOpen.value = true;
};

const copyFormLink = (form: IForms) => {
  if (!form.slug) return;
  copyLinkToClipboard('forms', {
    workspaceSlug: route.params.workspace,
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
