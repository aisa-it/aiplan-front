import { Dictionaries } from '@aisa-it/aiplan-api-ts/src/Dictionaries';
import {
  DtoCreateDictionaryRequest,
  DtoCreateDictionaryRowRequest,
  DtoDictionary,
  DtoDictionaryRow,
  DtoImportDictionaryRowsRequest,
  DtoImportDictionaryRowsResult,
  DtoUpdateDictionaryRequest,
  DtoUpdateDictionaryRowRequest,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const dictionariesApi = new (withInterceptors(Dictionaries))();

export type Dictionary = DtoDictionary;
export type DictionaryRow = DtoDictionaryRow;
export type ImportDictionaryRowsResult = DtoImportDictionaryRowsResult;

// коды ошибок справочников (BAK-365)
export const DICTIONARY_IN_USE_ERROR_CODE = 4513; // справочник используется полями проекта
export const ROW_IN_USE_ERROR_CODE = 4514; // на строку ссылаются задачи

export interface GetDictionaryRowsQuery {
  offset?: number;
  limit?: number;
  search_query?: string;
  include_archived?: boolean;
}

export interface DictionaryRowsResponse {
  count: number;
  offset: number;
  limit: number;
  result: DictionaryRow[];
}

export const getDictionaries = async (
  workspaceSlug: string,
  projectID: string,
) => {
  const response = await dictionariesApi.getDictionaryList(
    workspaceSlug,
    projectID,
  );
  return response.data;
};

export const createDictionary = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoCreateDictionaryRequest,
) => {
  const response = await dictionariesApi.createDictionary(
    workspaceSlug,
    projectID,
    data,
  );
  return response.data;
};

export const updateDictionary = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  data: DtoUpdateDictionaryRequest,
) => {
  const response = await dictionariesApi.updateDictionary(
    workspaceSlug,
    projectID,
    dictionaryID,
    data,
  );
  return response.data;
};

export const deleteDictionary = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
) => {
  await dictionariesApi.deleteDictionary(workspaceSlug, projectID, dictionaryID);
};

export const getDictionaryRows = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  query: GetDictionaryRowsQuery = {},
): Promise<DictionaryRowsResponse> => {
  const response = await dictionariesApi.getDictionaryRows(
    workspaceSlug,
    projectID,
    dictionaryID,
    query,
  );
  const data = response.data;
  return {
    count: data?.count || 0,
    offset: data?.offset || 0,
    limit: data?.limit || 0,
    result: data?.result || [],
  };
};

export const createDictionaryRow = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  data: DtoCreateDictionaryRowRequest,
) => {
  const response = await dictionariesApi.createDictionaryRow(
    workspaceSlug,
    projectID,
    dictionaryID,
    data,
  );
  return response.data;
};

export const updateDictionaryRow = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  rowID: string,
  data: DtoUpdateDictionaryRowRequest,
) => {
  const response = await dictionariesApi.updateDictionaryRow(
    workspaceSlug,
    projectID,
    dictionaryID,
    rowID,
    data,
  );
  return response.data;
};

export const deleteDictionaryRow = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  rowID: string,
) => {
  await dictionariesApi.deleteDictionaryRow(
    workspaceSlug,
    projectID,
    dictionaryID,
    rowID,
  );
};

export const importDictionaryRows = async (
  workspaceSlug: string,
  projectID: string,
  dictionaryID: string,
  data: DtoImportDictionaryRowsRequest,
): Promise<DtoImportDictionaryRowsResult> => {
  const response = await dictionariesApi.importDictionaryRows(
    workspaceSlug,
    projectID,
    dictionaryID,
    data,
  );
  return response.data || {};
};
