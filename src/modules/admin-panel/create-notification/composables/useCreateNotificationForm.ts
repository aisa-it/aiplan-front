import { ref, computed } from 'vue';
import { AiplanRequestMessage } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function useCreateNotificationForm() {
  const form = ref<AiplanRequestMessage>({
    title: '',
    msg: '',
    send_at: undefined,
    members: [],
  });

  const isErrorDate = ref(false);
  const isAllSelected = ref(false);
  const isSendNow = ref(false);

  const selectDate = ref();

  const toggleDate = (value: boolean) => {
    if (value) {
      form.value.send_at = undefined;
      isErrorDate.value = false;
    }
    isSendNow.value = value;
  };

  const toggleMembers = (value: boolean) => {
    if (value) form.value.members = [];
    isAllSelected.value = value;
  };

  const isReadyToSend = computed(() => {
    const hasNameAndDescription = form.value.title && form.value.msg;
    const hasRecipients = form.value.members?.length || isAllSelected.value;
    const hasDate = !!form.value.send_at || isSendNow.value;

    return (
      !isErrorDate.value && hasNameAndDescription && hasDate && hasRecipients
    );
  });

  const resetForm = () => {
    form.value.title = '';
    form.value.msg = '';
    form.value.send_at = undefined;
    form.value.members = [];
    isAllSelected.value = false;
    isSendNow.value = false;
    isErrorDate.value = false;
  };

  return {
    form,
    isErrorDate,
    isAllSelected,
    isSendNow,
    toggleDate,
    isReadyToSend,
    toggleMembers,
    resetForm,
    selectDate,
  };
}
