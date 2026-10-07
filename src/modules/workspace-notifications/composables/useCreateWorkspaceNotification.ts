import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';

import { NotificationsService } from '../api';

import type {
  AiplanRequestMessage,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

interface NotificationForm {
  members: string[];
  msg: string;
  send_at: string;
  title: string;
}

export function useCreateWorkspaceNotification() {
  const form = reactive<NotificationForm>({
    members: [],
    msg: '',
    send_at: '',
    title: '',
  });
  const isAllSelected = ref(false);
  const isDateInvalid = ref(false);
  const isLoadingMembers = ref(false);
  const isSending = ref(false);
  const isSendNow = ref(false);
  const members = ref<DtoWorkspaceMemberLight[]>([]);

  const availableMembers = computed(() =>
    members.value.filter(
      (membership) =>
        (membership.role ?? 0) > 5 &&
        membership.member?.is_active === true,
    ),
  );

  const isReadyToSend = computed(() => {
    const hasNameAndDescription = Boolean(form.title && form.msg);
    const hasRecipients = form.members.length > 0;
    const hasDate = Boolean(form.send_at);

    return (
      (hasNameAndDescription && isAllSelected.value && isSendNow.value) ||
      (hasNameAndDescription && hasRecipients && isSendNow.value) ||
      (hasNameAndDescription && hasDate && isAllSelected.value) ||
      (hasNameAndDescription && hasDate && hasRecipients)
    );
  });

  const reset = () => {
    form.members = [];
    form.msg = '';
    form.send_at = '';
    form.title = '';
    isAllSelected.value = false;
    isDateInvalid.value = false;
    isSendNow.value = false;
  };

  const loadMembers = async (workspaceSlug: string) => {
    isLoadingMembers.value = true;

    try {
      members.value =
        await NotificationsService.getWorkspaceMembers(workspaceSlug);
    } catch {
      // TODO: показать ошибку после переноса системы уведомлений.
    } finally {
      isLoadingMembers.value = false;
    }
  };

  const setAllSelected = (value: boolean | null) => {
    isAllSelected.value = Boolean(value);
    if (isAllSelected.value) form.members = [];
  };

  const setSendNow = (value: boolean | null) => {
    isSendNow.value = Boolean(value);

    if (isSendNow.value) {
      form.send_at = '';
      isDateInvalid.value = false;
    }
  };

  const send = async (workspaceSlug: string) => {
    if (!isSendNow.value) {
      const sendAt = dayjs(form.send_at);
      isDateInvalid.value =
        !sendAt.isValid() || sendAt.isBefore(dayjs(), 'minute');
    }

    if (isDateInvalid.value || !isReadyToSend.value || isSending.value) {
      return false;
    }

    const request: AiplanRequestMessage = {
      members: isAllSelected.value ? [] : form.members,
      msg: form.msg,
      send_at: isSendNow.value
        ? undefined
        : dayjs(form.send_at).toISOString(),
      title: form.title,
    };

    isSending.value = true;

    try {
      await NotificationsService.sendWorkspaceNotification(
        workspaceSlug,
        request,
      );
      return true;
    } catch {
      // TODO: показать ошибку после переноса системы уведомлений.
      return false;
    } finally {
      isSending.value = false;
    }
  };

  return {
    availableMembers,
    form,
    isAllSelected,
    isDateInvalid,
    isLoadingMembers,
    isReadyToSend,
    isSending,
    isSendNow,
    loadMembers,
    reset,
    send,
    setAllSelected,
    setSendNow,
  };
}
