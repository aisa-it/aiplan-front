import { ref } from 'vue';
import type { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function useReleaseNoteActions() {
  const modals = {
    show: ref(false),
    create: ref(false),
    update: ref(false),
    delete: ref(false),
  };

  const currentNote = ref<DtoReleaseNoteLight>({});

  const openShow = (note: DtoReleaseNoteLight) => {
    modals.show.value = true;
    currentNote.value = note;
  };

  const openCreate = () => {
    modals.create.value = true;
  };

  const openUpdate = (note: DtoReleaseNoteLight) => {
    modals.update.value = true;
    currentNote.value = note;
  };

  const openDelete = (note: DtoReleaseNoteLight) => {
    modals.delete.value = true;
    currentNote.value = note;
  };

  const resetNote = () => {
    currentNote.value = {};
  };

  return {
    modals,
    currentNote,
    openShow,
    openCreate,
    openUpdate,
    openDelete,
    resetNote,
  };
}
