<template>
  <ReleaseNoteHeader @create="openCreate" />

  <ReleaseNotesTable
    :rows="rows"
    :loading="loading"
    @edit="openUpdate"
    @delete="openDelete"
    @show="openShow"
  />

  <ShowReleaseNotesDialog
    v-model="modals.show.value"
    :release-note="currentNote"
  />

  <CreateReleaseNotesDialog
    v-model="modals.create.value"
    @success="notifySuccess"
    @error="notifyError"
  />

  <UpdateReleaseNotesDialog
    v-model="modals.update.value"
    :release-note="currentNote"
    @success="notifySuccess"
    @hide="resetNote"
  />

  <DeleteReleaseNotesDialog
    v-model="modals.delete.value"
    :release-note="currentNote"
    @onDelete="notifySuccess"
    @hide="resetNote"
  />
</template>

<script lang="ts" setup>
import { useUtilsStore } from 'src/stores/utils-store';
import { useNotificationStore } from 'src/stores/notification-store';

import ShowReleaseNotesDialog from './dialogs/ShowReleaseNotesDialog.vue';
import CreateReleaseNotesDialog from './dialogs/CreateReleaseNotesDialog.vue';
import UpdateReleaseNotesDialog from './dialogs/UpdateReleaseNotesDialog.vue';
import DeleteReleaseNotesDialog from './dialogs/DeleteReleaseNotesDialog.vue';
import ReleaseNoteHeader from './ui/ReleaseNoteHeader.vue';
import ReleaseNotesTable from './components/ReleaseNotesTable.vue';

import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useAsyncDataWithLoadOnMounted } from '../composables/useAsyncDataWithLoadOnMounted';
import { useReleaseNoteActions } from './composables/useReleaseNoteActions';

const utilsStore = useUtilsStore();
const { setNotificationView } = useNotificationStore();

const {
  modals,
  currentNote,
  openCreate,
  openUpdate,
  openDelete,
  openShow,
  resetNote,
} = useReleaseNoteActions();

const {
  loading,
  data: rows,
  execute: getReleaseNotes,
} = useAsyncDataWithLoadOnMounted<DtoReleaseNoteLight[]>(
  utilsStore.getReleaseNotes,
  [],
);

const notifySuccess = async (msg?: string) => {
  setNotificationView({ open: true, type: 'success', customMessage: msg });
  await getReleaseNotes();
};

const notifyError = (msg?: string) => {
  setNotificationView({ open: true, type: 'error', customMessage: msg });
};
</script>
