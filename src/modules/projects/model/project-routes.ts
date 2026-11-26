import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getProjectRoute(workspace: string, project: DtoProjectLight) {
  const key = project.identifier || project.id;
  return key ? { name: 'project', params: { workspace, project: key } } : null;
}
