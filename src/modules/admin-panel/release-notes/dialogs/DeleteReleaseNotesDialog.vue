<template>
  <q-dialog no-refocus @hide="emits('hide')">
    <q-card class="inner-modal-card">
      <DeleteReleaseNotesDialogHeader :tag_name="releaseNote?.tag_name ?? ''" />
      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <DeleteButton v-close-popup @click="deleteNote" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { api } from '../services/api';

import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import DeleteButton from 'src/components/buttons/DeleteButton.vue';

import DeleteReleaseNotesDialogHeader from '../ui/DeleteReleaseNotesDialogHeader.vue';

import { SUCCESS_DELETE_RELEASE_NOTE } from 'src/constants/notifications';

const props = defineProps<{
  releaseNote: DtoReleaseNoteLight;
}>();
const emits = defineEmits<{ onDelete: [msg: string]; hide: [] }>();

const deleteNote = async () => {
  await api.deleteReleaseNote(props.releaseNote?.id ?? '').then(() => {
    emits('onDelete', SUCCESS_DELETE_RELEASE_NOTE);
  });
};
</script>
