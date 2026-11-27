<template>
  <section class="min-w-0 p-4">
    <h1 class="mb-4 text-[2.125rem] font-normal leading-10 tracking-[0.25px]">
      {{ t('forms.title') }}
    </h1>

    <v-text-field
      v-model="searchQuery"
      :label="t('common.actions.search')"
      class="mb-4"
      density="compact"
      clearable
      hide-details
    />

    <v-data-table
      v-model:page="page"
      v-model:items-per-page="rowsPerPage"
      :headers="headers"
      :items="filteredForms"
      :loading="loading"
      :no-data-text="t(loadFailed ? 'forms.loadError' : 'forms.noForms')"
      item-value="slug"
      class="forms-table rounded-lg border border-solid border-border"
    >
      <template #item.end_date="{ item }">
        {{ item.end_date ? dayjs(item.end_date).format('DD.MM.YYYY') : '-' }}
      </template>

      <template #item.copy="{ item }">
        <v-btn
          :aria-label="t('forms.copyLink')"
          :title="t('forms.copyLink')"
          :disabled="!item.slug"
          icon
          :color="actionIconColor"
          variant="text"
          density="compact"
          @click.stop="copyFormLink(item.slug)"
        >
          <LinkIcon color="currentColor" aria-hidden="true" />
        </v-btn>
      </template>

      <template #item.edit>
        <v-btn
          :aria-label="t('common.actions.edit')"
          :title="t('common.actions.edit')"
          icon
          :color="actionIconColor"
          variant="text"
          density="compact"
          disabled
        >
          <EditIcon color="currentColor" aria-hidden="true" />
        </v-btn>
      </template>

      <template #item.delete="{ item }">
        <v-btn
          :aria-label="t('common.actions.delete')"
          :title="t('common.actions.delete')"
          :disabled="!item.slug || deleting"
          icon
          :color="actionIconColor"
          variant="text"
          density="compact"
          @click.stop="formToDelete = item"
        >
          <BinIcon color="currentColor" aria-hidden="true" />
        </v-btn>
      </template>

      <template #bottom>
        <PaginationDefault
          v-model:selected-page="page"
          v-model:rows-per-page="rowsPerPage"
          :rows-number="filteredForms.length"
          class="px-3 pb-2"
        />
      </template>
    </v-data-table>

    <DeleteFormDialog
      v-model="formToDelete"
      :deleting="deleting"
      @confirm="confirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import type { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import dayjs from 'dayjs';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';

import EditIcon from '@/components/icons/EditIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import PaginationDefault from '@/components/pagination/PaginationDefault.vue';
import BinIcon from '@/components/sidebar/icons/BinIcon.vue';
import { toast } from '@/modules/toast/toast';
import DeleteFormDialog from '../components/DeleteFormDialog.vue';
import { useFormsList } from '../composables/useFormsList';

const props = defineProps<{ workspaceSlug: string }>();
const { t } = useI18n();
const theme = useTheme();
const actionIconColor = computed(() =>
  theme.current.value.dark ? '#fff' : 'icon',
);

const { searchQuery, filteredForms, loading, loadFailed, deleting, deleteForm } =
  useFormsList(toRef(props, 'workspaceSlug'));

const page = ref(1);
const rowsPerPage = ref(10);
const formToDelete = ref<DtoFormLight | null>(null);

const headers = computed(() => [
  { key: 'title', title: t('forms.columns.title'), sortable: true },
  { key: 'slug', title: t('forms.columns.slug'), sortable: true },
  { key: 'end_date', title: t('forms.columns.endDate'), sortable: true },
  {
    key: 'fieldsCount',
    title: t('forms.columns.fieldsCount'),
    value: (form: DtoFormLight) => form.fields?.length ?? 0,
    align: 'center' as const,
    sortable: true,
  },
  {
    key: 'copy',
    title: t('forms.columns.link'),
    align: 'center' as const,
    sortable: false,
  },
  {
    key: 'edit',
    title: t('common.actions.edit'),
    align: 'center' as const,
    sortable: false,
  },
  {
    key: 'delete',
    title: t('common.actions.delete'),
    align: 'center' as const,
    sortable: false,
  },
]);

watch(searchQuery, () => {
  page.value = 1;
});

watch(
  () => props.workspaceSlug,
  () => {
    page.value = 1;
    formToDelete.value = null;
  },
);

async function copyFormLink(formSlug?: string) {
  if (!formSlug) return;

  const workspace = encodeURIComponent(props.workspaceSlug);
  const slug = encodeURIComponent(formSlug);
  try {
    await navigator.clipboard.writeText(`${location.origin}/f/${workspace}/${slug}`);
  } catch {
    toast.error(t('forms.copyError'));
  }
}

async function confirmDelete() {
  const form = formToDelete.value;
  if (!form?.slug || !(await deleteForm(form.slug))) return;

  if (formToDelete.value === form) formToDelete.value = null;
  toast.success(t('forms.deleteDialog.success'));
}
</script>

<style scoped>
.forms-table {
  font-size: 0.8125rem;
  font-weight: 400;
}

.forms-table :deep(.v-data-table__th) {
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
