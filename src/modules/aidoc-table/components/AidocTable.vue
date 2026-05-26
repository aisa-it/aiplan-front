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
      row-key="id"
      loading-label="Загружается..."
      no-data-label="Нет данных"
      :rows="filteredRows"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50, 100]"
      @row-click="openDoc"
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

      <template #body-cell-title="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <div :style="{ width: `${props.row.level * 18}px` }" />
            <q-btn
              v-if="props.row.has_child_docs"
              flat
              dense
              round
              size="sm"
              class="q-mr-xs"
              @click.stop="toggleExpand(props.row)"
            >
              <q-icon
                :name="isExpanded(props.row.id) ? 'expand_more' : 'chevron_right'"
                size="18px"
              />
            </q-btn>
            <div v-else class="q-mr-xs" style="width: 24px" />
            <span class="doc-title-cell">{{ props.row.title ?? '-' }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-copy_link="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="copyDocLink(props.row)"
          >
            <LinkIcon />
          </q-btn>
        </q-td>
      </template>

      <template #body-cell-access="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="openRulesDialog(props.row.id)"
          >
            <ManageAccountsIcon />
          </q-btn>
        </q-td>
      </template>

      <template #body-cell-watchers="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="openWatchersDialog(props.row.id)"
          >
            <VisibilityIcon />
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <EmptyStateTable :loading="loading" title="Нет документов">
          <DocumentIcon :width="56" :height="56" />
        </EmptyStateTable>
      </template>
    </q-table>

    <AidocRulesDialog
      v-model="isRulesDialogOpen"
      :roles="{
        editor_role: docInfo.editor_role,
        reader_role: docInfo.reader_role,
        reader_ids: docInfo.reader_ids,
        editor_ids: docInfo.editor_ids,
      }"
      :isAdminOrAuthor="isAdminOrAuthor"
      @update:roles="(val) => updateDocument(val)"
    />

    <AidocWatchersDialog
      v-model="isWatchersDialogOpen"
      :can-edit="canEdit"
      :loading="docLoading"
      :doc-id="docInfo.id"
      :watchers="docInfo.watchers"
      @refresh="refreshDocInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { QTableColumn } from 'quasar';
import type { DtoDocLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useAiDocStore } from 'src/stores/aidoc-store';
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';

import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import VisibilityIcon from 'src/components/icons/VisibilityIcon.vue';
import ManageAccountsIcon from 'src/components/icons/ManageAccountsIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import AidocRulesDialog from 'src/components/aidoc/AidocRulesDialog.vue';
import AidocWatchersDialog from 'src/components/aidoc/AidocWatchersDialog.vue';
import EmptyStateTable from 'src/modules/admin-panel/ui/EmptyStateTable.vue';
import { useNotificationStore } from 'stores/notification-store';
import {
  BASE_ERROR,
  SUCCESS_UPDATE_DOCUMENT,
} from 'src/constants/notifications';

const route = useRoute();
const router = useRouter();
const aidocStore = useAiDocStore();
const userStore = useUserStore();
const { hasPermission, getWsRole } = useRolesStore();
const { setNotificationView } = useNotificationStore();

const { rootDocs } = storeToRefs(aidocStore);
const { user } = storeToRefs(userStore);

const loading = ref(false);
const docLoading = ref(false);
const searchQuery = ref('');
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
});
const isRulesDialogOpen = ref(false);
const isWatchersDialogOpen = ref(false);
const docInfo = ref<Record<string, any>>({});
const expandedDocIds = ref<string[]>([]);
const childDocsMap = ref<Record<string, DtoDocLight[]>>({});

const columns: QTableColumn<DtoDocLight>[] = [
  {
    name: 'title',
    align: 'left',
    label: 'Название',
    sortable: true,
    field: (row) => row.title ?? '-',
  },
  {
    name: 'access',
    align: 'center',
    label: 'Права доступа',
    field: (row) => row,
  },
  {
    name: 'watchers',
    align: 'center',
    label: 'Наблюдатели',
    field: (row) => row,
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
  const matchesQuery = (doc) =>
    !query || `${doc.title ?? ''}`.toLowerCase().includes(query);
  const roots = rootDocs.value.filter(matchesQuery);

  const flattenRows = (docs, level = 0) => {
    return docs.flatMap((doc) => {
      const row = { ...doc, level };
      const children = childDocsMap.value[doc.id ?? ''] ?? [];

      if (!doc.id || !isExpanded(doc.id) || !children.length) return [row];
      return [row, ...flattenRows(children, level + 1)];
    });
  };

  return flattenRows(roots);
});

const workspaceSlug = computed(() => route.params.workspace);

const currentUserRole = computed(() => getWsRole(workspaceSlug.value));

const isAdminOrAuthor = computed(() => {
  return (
    hasPermission('change-issue-primary')
  );
});

const canEdit = computed(() => {
  return (
    currentUserRole.value >= (docInfo.value?.editor_role ?? 0) ||
    docInfo.value?.editor_ids?.includes(user.value?.id) ||
    isAdminOrAuthor.value
  );
});

const refresh = async () => {
  if (!workspaceSlug.value) return

  loading.value = true;
  try {
    await aidocStore.getRootDocs(workspaceSlug.value);
    expandedDocIds.value = [];
    childDocsMap.value = {};
  } finally {
    loading.value = false;
  }
};

const getDocInfo = async (id: string) => {
  if (!workspaceSlug.value) return;

  try {
    docLoading.value = true;
    const response = await aidocStore.getAiDoc(workspaceSlug.value, id);
    if (!response) return;
    const { data } = response;
    docInfo.value = { ...data };
  } finally {
    docLoading.value = false;
  }
};

const refreshDocInfo = async () => {
  if (!docInfo.value?.id) return;
  await getDocInfo(docInfo.value.id);
};

const openRulesDialog = async (id?: string) => {
  if (!id) return;
  await getDocInfo(id);
  isRulesDialogOpen.value = true;
};

const openWatchersDialog = async (id?: string) => {
  if (!id) return;
  await getDocInfo(id);
  isWatchersDialogOpen.value = true;
};

const updateDocument = async (roles: Record<string, any> = {}) => {
  if (!workspaceSlug.value || !docInfo.value?.id) return;

  try {
    await aidocStore.updateDocument(
      {
        doc: {
          reader_role: roles.reader_role ?? undefined,
          editor_role: roles.editor_role ?? undefined,
          reader_list: roles.reader_ids ?? undefined,
          editor_list: roles.editor_ids ?? undefined,
        },
      },
      workspaceSlug.value,
      docInfo.value.id,
    );
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_UPDATE_DOCUMENT,
    });
    await refreshDocInfo();
  } catch {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: BASE_ERROR,
    });
  }
};

const openDoc = (_event: Event, doc: DtoDocLight) => {
  if (!doc.id) return;
  router.push(`/${route.params.workspace}/aidoc/${doc.id}`);
};

const isExpanded = (id?: string) => {
  if (!id) return false;
  return expandedDocIds.value.includes(id);
};

const toggleExpand = async (doc: DtoDocLight) => {
  const expanded = isExpanded(doc.id);
  if (expanded) {
    expandedDocIds.value = expandedDocIds.value.filter((id) => id !== doc.id);
    return;
  }

  if (!childDocsMap.value[doc.id]) {
    const response = await aidocStore.getChildDocList(workspaceSlug.value, doc.id);
    childDocsMap.value[doc.id] = (response?.data ?? []);
  }

  expandedDocIds.value = [...expandedDocIds.value, doc.id];
};

const copyDocLink = (doc: DtoDocLight) => {
  if (!doc.id) return;
  copyLinkToClipboard('docs', {
    workspaceSlug: route.params.workspace,
    docsId: doc.id,
  });
};

watch(
  () => route.params.workspace,
  () => {
    refresh();
  },
);

onMounted(refresh);
</script>

<style scoped lang="scss">
.doc-title-cell {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
