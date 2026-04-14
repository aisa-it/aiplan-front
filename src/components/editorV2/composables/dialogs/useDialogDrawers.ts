import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

// Управление боковыми панелями q-drawer в диалоговом окне q-dialog
export const useDialogDrawers = (initialLeft = true, initialRight = true) => {
  const $q = useQuasar();

  const drawerWidth = computed<number>(() =>
    $q.screen.width > 1280 ? 300 : 200,
  );
  const leftDrawerOpen = ref<boolean>(initialLeft);
  const rightDrawerOpen = ref<boolean>(initialRight);

  const toggleLeftDrawer = (): void => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };
  const toggleRightDrawer = (): void => {
    rightDrawerOpen.value = !rightDrawerOpen.value;
  };

  return {
    drawerWidth,
    leftDrawerOpen,
    rightDrawerOpen,
    toggleLeftDrawer,
    toggleRightDrawer,
  };
};
