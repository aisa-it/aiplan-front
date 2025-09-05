import {
  DaoPaginationResponse,
  DtoIssueTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { projectsApi } from '../../services/api';

type AddIssueTemplateArgs = Parameters<typeof projectsApi.createIssueTemplate>;
type DeleteIssueTemplateArgs = Parameters<
  typeof projectsApi.deleteIssueTemplate
>;
type UpdateIssueTemplateArgs = Parameters<
  typeof projectsApi.updateIssueTemplate
>;
type GetIssueTemplatesArgs = Parameters<
  typeof projectsApi.getProjectIssueTemplates
>;
type GetSingleIssueTemplateArgs = Parameters<
  typeof projectsApi.getIssueTemplate
>;

const issueTemplateService = {
  addIssueTemplate: async (...value: AddIssueTemplateArgs): Promise<any> => {
    return await projectsApi.createIssueTemplate(...value);
  },
  deleteIssueTemplate: async (
    ...value: DeleteIssueTemplateArgs
  ): Promise<any> => {
    return await projectsApi.deleteIssueTemplate(...value);
  },
  updateIssueTemplate: async (
    ...value: UpdateIssueTemplateArgs
  ): Promise<any> => {
    return await projectsApi.updateIssueTemplate(...value);
  },
  getIssueTemplates: async (
    ...value: GetIssueTemplatesArgs
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoIssueTemplate[];
    }
  > => {
    const { data } = await projectsApi.getProjectIssueTemplates(...value);
    return data;
  },
  getIssueTemplateById: async (
    ...value: GetSingleIssueTemplateArgs
  ): Promise<DtoIssueTemplate> => {
    const { data } = await projectsApi.getIssueTemplate(...value);
    return data;
  },
};

export default issueTemplateService;
export type {
  AddIssueTemplateArgs,
  DeleteIssueTemplateArgs,
  UpdateIssueTemplateArgs,
  GetIssueTemplatesArgs,
  GetSingleIssueTemplateArgs,
};
