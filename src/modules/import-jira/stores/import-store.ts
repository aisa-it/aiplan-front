import { defineStore } from 'pinia';
import {
  cancelJiraImport,
  getImportsInfo,
  startImport,
  getJiraInfo,
  StartJiraImportArgs,
  GetJiraInfoArgs,
  GetImportsInfoArg,
  GetImportInfoArg,
  getImportInfo,
} from '../services/api';
import type {
  AiplanJiraInfoRequest,
  EntityJiraInfo,
  IssuesImportImportStatus,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IImportJiraProject } from 'src/interfaces/jira';
import { get } from 'http';

export const useImportStore = defineStore('import-store', {
  state: () => {
    return {
      importJiraInfo: null as EntityJiraInfo | null,
      jiraProject: null as IImportJiraProject | null, // нужен отдельный сгенерированный тип для этого свойства
      userWs: null as any,
      userInfo: null as AiplanJiraInfoRequest | null,
      importInfo: null as IssuesImportImportStatus | null,
      userImports: null as Array<IssuesImportImportStatus> | null,
    };
  },
  actions: {
    async getJiraInfo(...args: GetJiraInfoArgs) {
      const data = await getJiraInfo(...args);
      this.userInfo = args[0];
      this.importJiraInfo = data;
      return data;
    },

    async getImportsInfo(...args: GetImportsInfoArg) {
      const data = await getImportsInfo(...args);
      this.userImports = data.imports ? data.imports : [];
      return data;
    },

    async getImportInfo(...args: GetImportInfoArg) {
      const data = await getImportInfo(...args);
      this.importInfo = data;
      return data;
    },

    async setJiraProject(project: IImportJiraProject) {
      this.jiraProject = project;
    },

    async setUserWs(ws: any) {
      this.userWs = ws;
    },

    async startImport(...args: StartJiraImportArgs) {
      const data = await startImport(...args);
      this.importInfo = data as any;
      return data;
    },

    async clearState() {
      this.importJiraInfo = null;
      this.jiraProject = null;
      this.userWs = null;
      this.userInfo = null;
    },

    async stopImport(importId: string) {
      await cancelJiraImport(importId);
    },
  },
});
