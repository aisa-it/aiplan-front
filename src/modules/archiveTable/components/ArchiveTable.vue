<template>
  <div>
    <q-input
      v-model="projectSearch"
      class="base-input q-mb-md"
      label="Поиск"
      dense
      clearable
      @update:model-value="() => searchProjects()"
    />
    <q-table
      flat
      bordered
      :rows="archivedProjects"
      :columns="columns"
      :rows-per-page-options="[10, 25, 50]"
      @row-click="
        (_, row) => router.push(`projects/${row.identifier}/issues`)
      "
      @row-contextmenu.prevent="onRowContextMenu"
    >
      <template v-slot:body-cell-copy_link="props">
        <q-td :props="props">
          <q-btn
            class="btn-only-icon-sm"
            dense
            flat
            no-caps
            no-wrap
            @click.stop="copyLink(props.row)"
          >
            <LinkIcon />
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <ProjectContextMenu v-if="contextRow"
      :row="contextRow"
      :anchor-event="contextEvent"
      is-archive
      />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QTableColumn } from 'quasar';
import { debounce } from 'quasar';

import { searchWorkspaceArchivedProjects } from '../api';
import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { copyLinkToClipboard } from 'src/utils/copyLinkToClipboard';

import LinkIcon from 'src/components/icons/LinkIcon.vue';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';
import ProjectContextMenu from 'src/shared/components/ProjectContextMenu.vue'
const workspaceStore = useWorkspaceStore();
const { workspaceArchive, currentWorkspaceSlug } = storeToRefs(workspaceStore);

const route = useRoute();
const router = useRouter();
const projectSearch = ref('');
const contextRow = ref<DtoProjectLight>();
const contextEvent = ref<MouseEvent | null>(null);
const archivedProjects = ref<DtoProjectLight[]>([]);

const columns: QTableColumn<DtoProjectLight>[] = [
  {
    name: 'emoji',
    align: 'center',
    label: 'Эмодзи',
    sortable: false,
    style: () => 'width: 14px',
    field: (row) => String.fromCodePoint(parseInt(row.emoji as string)),
  },
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name,
  },

  {
    name: 'identifier',
    align: 'left',
    label: 'Идентификатор',
    sortable: true,
    field: (row) => row.identifier,
  },
  {
    name: 'total_members',
    align: 'left',
    label: 'Кол-во участников',
    sortable: true,
    field: (row) => row.total_members,
  },
  {
    name: 'copy_link',
    align: 'center',
    label: 'Ссылка',
    field: (row) => row,
  },
];

const onRowContextMenu = (evt, row: DtoProjectLight) => {
  contextRow.value = row;
  contextEvent.value = evt;
};

const copyLink = (project: DtoProjectLight) => {
  copyLinkToClipboard('project', {
    workspaceSlug: route.params.workspace as string,
    projectIdentifier: project.identifier,
  });
};

const searchProjects = debounce(async () => {
  archivedProjects.value = await searchWorkspaceArchivedProjects(
    route.params.workspace as string,
    projectSearch.value,
  );
}, 500);

const refreshArchivedProjects = async () => {
  await workspaceStore.getWorkspaceArchivedProjects(currentWorkspaceSlug.value as string);
};

onMounted(async () => {
  if (!currentWorkspaceSlug.value) return;
  await refreshArchivedProjects();
  archivedProjects.value = workspaceArchive.value;
});

watch(currentWorkspaceSlug, async (newValue) => {
  if (!newValue) return;
  await workspaceStore.getWorkspaceArchivedProjects(newValue as string);
});

watch(() => workspaceArchive.value, () => {
  if (projectSearch.value) {
    searchProjects();
  } else {
    archivedProjects.value = workspaceArchive.value;
  }
})
</script>
