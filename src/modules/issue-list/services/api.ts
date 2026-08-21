import { PropertyTemplates } from '@aisa-it/aiplan-api-ts/src/PropertyTemplates';
import { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const propertyTemplatesApi = new (withInterceptors(PropertyTemplates))();

export const getPropertyTemplates = async (
  workspaceSlug: string,
  projectID: string,
): Promise<DtoProjectPropertyTemplate[]> => {
  const response = await propertyTemplatesApi.getPropertyTemplateList(
    workspaceSlug,
    projectID,
  );
  return response.data;
};
