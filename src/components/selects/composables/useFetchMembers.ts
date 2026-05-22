import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { Pagination } from '../types/types';

type MembersSourceType = 'workspace' | 'project';

export function useFetchMembers(
  type: MembersSourceType,
  options?: {
    projectId?: string;
  },
) {
  const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
  const projectStore = useProjectStore();
  const workspaceStore = useWorkspaceStore();

  const fetchMembers = (pagination: Pagination, searchQuery?: string) => {
    if (type === 'project') {
      if (!options?.projectId) throw new Error('отсутствует projectId');

      return projectStore.getProjectMembers(
        currentWorkspaceSlug.value!,
        options.projectId,
        {
          offset: pagination.offset,
          limit: pagination.limit,
          search_query: searchQuery,
          order_by: pagination.order_by,
          desc: pagination.desc,
        },
      );
    }

    return workspaceStore.getWorkspaceMembers(currentWorkspaceSlug.value!, {
      offset: pagination.offset,
      limit: pagination.limit,
      search_query: searchQuery,
      order_by: pagination.order_by,
      desc: pagination.desc,
    });
  };

  return {
    fetchMembers,
  };
}
