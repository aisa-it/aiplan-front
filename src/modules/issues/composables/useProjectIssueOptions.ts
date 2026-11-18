import { ref, watch, type Ref } from 'vue';
import type {
  DtoProjectPropertyTemplate,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { PropertyTemplates } from '@aisa-it/aiplan-api-ts/src/PropertyTemplates';
import { projectsApi } from '@/services/clients';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type { ProjectIssueListScope } from '../model/issue-list.types';

const propertyTemplatesApi = new (withInterceptors(PropertyTemplates))();

export const useProjectIssueOptions = (scope: Ref<ProjectIssueListScope | undefined>) => {
  const statuses = ref<DtoStateLight[]>([]);
  const propertyTemplates = ref<DtoProjectPropertyTemplate[]>([]);
  const isLoading = ref(false);
  let requestNumber = 0;

  watch(scope, async (currentScope, _previousScope, onCleanup) => {
    const request = ++requestNumber;
    const controller = new AbortController();
    onCleanup(() => controller.abort());
    statuses.value = [];
    propertyTemplates.value = [];
    isLoading.value = Boolean(currentScope);
    if (!currentScope) return;

    const { workspaceSlug, projectId } = currentScope;
    const [statesResult, templatesResult] = await Promise.allSettled([
      projectsApi.getStateList(workspaceSlug, projectId, undefined, {
        signal: controller.signal,
      }),
      propertyTemplatesApi.getPropertyTemplateList(workspaceSlug, projectId, {
        signal: controller.signal,
      }),
    ]);
    if (request !== requestNumber) return;
    isLoading.value = false;

    if (statesResult.status === 'fulfilled') {
      statuses.value = Object.values(statesResult.value.data).flat();
    }
    if (templatesResult.status === 'fulfilled') {
      propertyTemplates.value = templatesResult.value.data
        .filter((template) => template.id && template.name)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
  }, { immediate: true });

  return { statuses, propertyTemplates, isLoading };
};
