import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useFetchMembers } from './useFetchMembers';
import { Member } from '../types/types';
import { storeToRefs } from 'pinia';
import { MemberToIdArray } from '../helpers/helpers';

export function useAidocWatchers(docId: string) {
  const aidocStore = useAiDocStore();
  const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
  const { setNotificationView } = useNotificationStore();

  const { fetchMembers } = useFetchMembers('workspace');

  const update = async (members: Member[]) => {
    await aidocStore.updateDocument(
      {
        doc: {
          watcher_list: MemberToIdArray(members),
        },
      },
      currentWorkspaceSlug.value as string,
      docId,
    );
    setNotificationView({ open: true, type: 'success' });
  };

  return {
    label: 'Наблюдатель',
    fetchMembers,
    update,
  };
}
