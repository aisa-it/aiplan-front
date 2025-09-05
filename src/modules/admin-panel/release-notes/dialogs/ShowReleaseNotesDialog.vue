<template>
  <q-dialog
    ref="dialogRef"
    class="admin-release-note-dialog"
    @hide="handleHide"
  >
    <BaseReleaseNoteDialog
      @cancel="hideDialog"
      :initial-content="releaseNote?.body"
      read-only
    />
  </q-dialog>
</template>

<script lang="ts" setup>
import BaseReleaseNoteDialog from './BaseReleaseNotesDialog.vue';

import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useDialog } from '../composables/useDialog';

defineProps<{
  releaseNote: DtoReleaseNoteLight;
}>();

const emits = defineEmits<{ hide: [] }>();

const { dialogRef, hideDialog } = useDialog();

const handleHide = () => {
  emits('hide');
};
</script>
