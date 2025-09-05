import { Integrations } from '@aisa-it/aiplan-api-ts/src/Integrations';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { API_IMPORT_JIRA_PREFIX } from 'src/constants/apiPrefix';
import { api } from 'src/stores/aiplan-store';
import {
  EntityJiraInfo,
  IssuesImportImportStatus,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const importApi = new (withInterceptors(Integrations))();

export type GetJiraInfoArgs = Parameters<typeof importApi.getJiraInfo>;
export type CancelJiraImportArgs = Parameters<
  typeof importApi.cancelJiraImport
>;
export type GetImportInfoArg = Parameters<typeof importApi.getJiraImportStatus>;
export type GetImportsInfoArg = Parameters<typeof importApi.getMyImportList>;
export type StartJiraImportArgs = Parameters<typeof importApi.startJiraImport>;
export async function cancelJiraImport(...body: CancelJiraImportArgs) {
  await importApi.cancelJiraImport(...body);
}

export async function getJiraInfo(
  ...body: GetJiraInfoArgs
): Promise<EntityJiraInfo> {
  const { data } = await importApi.getJiraInfo(...body);
  return data;
}

export async function getImportsInfo(...body: GetImportsInfoArg) {
  const { data } = await importApi.getMyImportList(...body);
  return data;
}

export async function getImportInfo(
  ...body: GetImportInfoArg
): Promise<IssuesImportImportStatus> {
  const { data } = await importApi.getJiraImportStatus(...body);
  return data;
}

export async function startImport(
  ...body: StartJiraImportArgs
): Promise<Record<string, string>> {
  const { data } = await importApi.startJiraImport(...body);
  return data;
}


