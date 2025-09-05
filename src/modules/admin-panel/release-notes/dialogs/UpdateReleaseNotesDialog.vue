<template>
  <q-dialog
    ref="dialogRef"
    persistent
    no-refocus
    class="admin-release-note-dialog"
    @hide="emits('hide')"
  >
    <BaseReleaseNotesDialog
      :loading="loading"
      @save="handleSave"
      @cancel="hideDialog"
      :initial-content="releaseNote.body"
    />
  </q-dialog>
</template>

<script lang="ts" setup>
import { api } from '../services/api';

import BaseReleaseNotesDialog from './BaseReleaseNotesDialog.vue';

import { SUCCESS_UPDATE_RELEASE_NOTE } from 'src/constants/notifications';

import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useDialog } from '../composables/useDialog';
import { useLoad } from 'src/composables/useLoad';

const props = defineProps<{
  releaseNote: DtoReleaseNoteLight;
}>();

const emits = defineEmits<{
  hide: [];
  success: [msg: string];
  error: [msg?: string];
}>();

const { loading, onLoad } = useLoad(api.updateReleaseNote);
const { dialogRef, hideDialog } = useDialog();

const handleSave = async (content: string) => {
  const saveData = {
    id: props.releaseNote?.id,
    body: content,
    published_at: new Date().toISOString(),
  } as DtoReleaseNoteLight;

  await onLoad(saveData.id, saveData)
    .then(() => {
      emits('success', SUCCESS_UPDATE_RELEASE_NOTE);
      hideDialog();
    })
    .catch(() => {
      emits('error');
    });
};
</script>
