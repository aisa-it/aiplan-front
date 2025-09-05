import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';

export function useBlockDialog() {
  const isBlockDialogShow = ref(false);
  const currentUser = ref();

  const openBlockDialog = (user: DtoUserLight) => {
    isBlockDialogShow.value = true;
    currentUser.value = user;
  };

  return {
    isBlockDialogShow,
    currentUser,
    openBlockDialog,
  };
}
