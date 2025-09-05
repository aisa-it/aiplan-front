import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiAdminPanel = new (withInterceptors(AdminPanel))();

export const api = {
  updateReleaseNote: async (
    noteId: string,
    data: DtoReleaseNoteLight,
  ): Promise<DtoReleaseNoteLight> => {
    return apiAdminPanel
      .updateReleaseNote(noteId, data)
      .then((res) => res.data);
  },

  createReleaseNote: async (data: DtoReleaseNoteLight): Promise<void> => {
    await apiAdminPanel.createReleaseNote(data);
  },

  deleteReleaseNote: async (noteId: string): Promise<void> => {
    apiAdminPanel.deleteReleaseNote(noteId);
  },
};
