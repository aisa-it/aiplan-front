import { PropertyTemplates } from '@aisa-it/aiplan-api-ts/src/PropertyTemplates';
import {
  DtoCreatePropertyTemplateRequest,
  DtoUpdatePropertyTemplateRequest,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const propertyTemplatesApi = new (withInterceptors(PropertyTemplates))();

export type PropertyTemplate = DtoProjectPropertyTemplate;

export const getPropertyTemplates = async (
  workspaceSlug: string,
  projectID: string,
) => {
  const response = await propertyTemplatesApi.getPropertyTemplateList(
    workspaceSlug,
    projectID,
  );
  return response.data;
};

export const createPropertyTemplate = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoCreatePropertyTemplateRequest,
) => {
  const response = await propertyTemplatesApi.createPropertyTemplate(
    workspaceSlug,
    projectID,
    data,
  );
  return response.data;
};

export const updatePropertyTemplate = async (
  workspaceSlug: string,
  projectID: string,
  templateID: string,
  data: DtoUpdatePropertyTemplateRequest,
) => {
  const response = await propertyTemplatesApi.updatePropertyTemplate(
    workspaceSlug,
    projectID,
    templateID,
    data,
  );
  return response.data;
};

export const deletePropertyTemplate = async (
  workspaceSlug: string,
  projectID: string,
  templateID: string,
) => {
  await propertyTemplatesApi.deletePropertyTemplate(
    workspaceSlug,
    projectID,
    templateID,
  );
};
