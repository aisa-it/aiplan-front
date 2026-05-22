import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useFetchMembers } from './useFetchMembers';
import { Member } from '../types/types';
import { storeToRefs } from 'pinia';
import { MemberToIdArray } from '../helpers/helpers';

export function useIssueAssignee(projectId: string, issueId: string) {
  const singleIssueStore = useSingleIssueStore();
  const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
  const { setNotificationView } = useNotificationStore();

  const { fetchMembers } = useFetchMembers('project', { projectId });

  const update = async (members: Member[]) => {
    await singleIssueStore.updateIssueData(
      currentWorkspaceSlug.value as string,
      projectId,
      issueId,
      {
        assignees_list: MemberToIdArray(members),
      },
    );
    setNotificationView({ open: true, type: 'success' });
  };

  return {
    label: 'Исполнитель',
    fetchMembers,
    update,
  };
}
