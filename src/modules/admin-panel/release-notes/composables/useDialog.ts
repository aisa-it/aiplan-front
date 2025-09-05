import { ref } from 'vue';
import type { QDialog } from 'quasar';

export function useDialog() {
  const dialogRef = ref<QDialog>();

  const hideDialog = () => {
    if (dialogRef.value) {
      dialogRef.value.hide();
    }
  };

  return {
    dialogRef,
    hideDialog,
  };
}
