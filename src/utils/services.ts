import { storeToRefs } from 'pinia';
import { useAiplanStore } from 'src/stores/aiplan-store';

const api = useAiplanStore();

export async function useWorkspaceMembers() {
  const { me } = storeToRefs(api);
  const workspaceMembers = await api.workspaceMembers();

  const hasJoined = workspaceMembers?.some(
    (item: any) => item.member.id === (me as any)?.id,
  );

  const isOwner =
    workspaceMembers?.some(
      (item: any) =>
        item.member.id === (me.value as any)?.id && item.role === 15,
    ) ||
    me.value.is_superuser ||
    me.value.is_staff;
  const isMember = workspaceMembers?.some(
    (item: any) => item.member.id === (me.value as any)?.id && item.role === 15,
  );
  const isViewer = workspaceMembers?.some(
    (item: any) => item.member.id === (me.value as any)?.id && item.role === 10,
  );
  const isGuest = workspaceMembers?.some(
    (item: any) => item.member.id === (me.value as any)?.id && item.role === 5,
  );

  return {
    workspaceMembers,
    hasJoined,
    isOwner,
    isMember,
    isViewer,
    isGuest,
  };
}
