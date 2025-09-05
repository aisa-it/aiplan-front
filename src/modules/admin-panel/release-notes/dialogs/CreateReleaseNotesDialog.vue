<template>
  <q-dialog
    ref="dialogRef"
    persistent
    no-refocus
    class="admin-release-note-dialog"
    @hide="handleHide"
  >
    <BaseReleaseNoteDialog
      :loading="loading"
      @save="handleSave"
      @cancel="hideDialog"
    />
  </q-dialog>
</template>

<script lang="ts" setup>
import { api } from '../services/api';

import BaseReleaseNoteDialog from './BaseReleaseNotesDialog.vue';

import {
  ERROR_IDENTITY_RELEASE_NOTE,
  SUCCESS_CREATE_RELEASE_NOTE,
} from 'src/constants/notifications';

import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useDialog } from '../composables/useDialog';
import { useLoad } from 'src/composables/useLoad';

const emits = defineEmits<{
  hide: [];
  success: [msg: string];
  error: [msg?: string];
}>();

const { loading, onLoad } = useLoad(api.createReleaseNote);
const { dialogRef, hideDialog } = useDialog();

const handleHide = () => {
  emits('hide');
};

const handleSave = async (content: string) => {
  const saveData = {
    body: content,
    published_at: new Date().toISOString(),
  } as DtoReleaseNoteLight;

  await onLoad(saveData)
    .then(() => {
      emits('success', SUCCESS_CREATE_RELEASE_NOTE);
      hideDialog();
    })
    .catch((err) => {
      if (err.response?.data?.code === 9005) {
        emits('error', ERROR_IDENTITY_RELEASE_NOTE);
      } else {
        emits('error');
      }
    });
};
</script>
