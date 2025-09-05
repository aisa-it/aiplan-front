import { ref } from 'vue';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

// TODO вытащить в общий компонент для разрыва связи между модулями
import issueTemplateService from 'src/modules/project-settings/new-issue-template/services/api';

export function useSingleIssueTemplate() {
  const store = useSingleIssueStore();
  const options = ref<any[]>([]);
  const loading = ref(false);
  const offset = ref(0);
  const limit = 20;
  const hasMore = ref(true);

  const fetchTemplates = async (
    workspaceSlug: string,
    projectId: string,
    reset = false,
    search = '',
  ) => {
    if (loading.value) return;
    loading.value = true;
    try {
      const { result } = await issueTemplateService.getIssueTemplates(
        workspaceSlug,
        projectId,
        { offset: reset ? 0 : offset.value, limit, search },
      );
      const items = [...result];
      if (reset) {
        options.value = items;
        offset.value = items.length;
      } else {
        options.value = [...options.value, ...items];
        offset.value += items.length;
      }
      hasMore.value = items.length === limit;
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
    loading.value = false;
  };

  const fetchOnScroll = (
    workspaceSlug: string,
    projectId: string,
    arg: any,
  ) => {
    if (hasMore.value && arg.to >= options.value.length - 1) {
      fetchTemplates(workspaceSlug, projectId, false, '');
    }
  };

  const deleteTemplate = async (
    workspaceSlug: string,
    projectId: string,
    id: string,
  ) => {
    loading.value = true;
    try {
      await issueTemplateService.deleteIssueTemplate(
        workspaceSlug,
        projectId,
        id,
      );
    } catch (error) {
      console.error('Error deleting template:', error);
    }
    loading.value = false;
  };

  const updateTemplate = async (
    workspaceSlug: string,
    projectId: string,
    id: string,
    template: string,
    name: string,
  ) => {
    loading.value = true;
    try {
      await issueTemplateService.updateIssueTemplate(
        workspaceSlug,
        projectId,
        id,
        { template, name },
      );
    } catch (error) {
      console.error('Error updating template:', error);
    } finally {
      loading.value = false;
    }
  };

  const createSingleIssueTemplate = async (
    workspaceSlug: string,
    projectId: string,
    template: string,
    name: string,
  ) => {
    loading.value = true;
    try {
      await issueTemplateService.addIssueTemplate(workspaceSlug, projectId, {
        template,
        Name: name,
      });
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    fetchTemplates,
    deleteTemplate,
    createSingleIssueTemplate,
    updateTemplate,
    fetchOnScroll,
    options,
    loading,
    hasMore,
    offset,
    limit,
  };
}
