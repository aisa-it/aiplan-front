import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ref } from 'vue';

export function useDeleteDialog() {
  const isDeleteDialogShow = ref<boolean>(false);
  const currentUser = ref<DtoUserLight | undefined>();

  const openDeleteDialog = (user: DtoUserLight): void => {
    isDeleteDialogShow.value = true;
    currentUser.value = user;
  };

  return {
    isDeleteDialogShow,
    currentUser,
    openDeleteDialog,
  };
}
