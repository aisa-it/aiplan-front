import type { DtoSprintFolder, DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const ROOT_SPRINT_FOLDER_ID = '00000000-0000-0000-0000-000000000000';

export type SprintFolder = DtoSprintFolder & { id: string; sprints: DtoSprintLight[] };

export type SprintOverviewAction =
  | { type: 'createFolder' }
  | { type: 'renameFolder' | 'deleteFolder' | 'deleteSprint'; id: string; name: string }
  | { type: 'moveSprint'; id: string; name: string; folderId: string };
