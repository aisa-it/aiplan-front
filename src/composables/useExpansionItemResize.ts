import { MenuItem, MenuLayout } from 'src/interfaces/ui';
import { computed, inject, onBeforeUnmount, onMounted, Ref, watch } from 'vue';

export function useExpansionItemResize(
  id: string,
  menuItemRef: Ref<HTMLElement | null>,
  resizerRef: Ref<HTMLElement | null>,
  isExpanded: Ref<boolean>,
  minHeight: Ref<number>,
) {
  const menuItems = inject<{
    resizeBy: (id: string, deltaPx: number, withSave?: boolean) => void;
    getHeight: (id: string) => number | undefined;
    registerItem: (item: Omit<MenuItem, 'weight'>) => void;
    unregisterItem: (id: string) => void;
    updateItem: (
      id: string,
      patch: { minHeight?: number; open?: boolean },
    ) => void;
    loadLayout: () => MenuLayout;
  }>('menuItems');

  let startY = 0;
  let dragging = false;
  const draggingClass = 'menu-item--dragging';
  const height = computed(() => menuItems?.getHeight(id));
  const isOpen = computed(() => menuItems?.loadLayout().open[id]);
  function onPointerDown(e: PointerEvent) {
    if (!menuItems || !menuItemRef.value || !isExpanded.value) return;

    dragging = true;
    startY = e.clientY;
    menuItemRef?.value?.previousElementSibling?.classList.add(draggingClass);
    menuItemRef?.value?.classList.add(draggingClass);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !menuItems || !isExpanded.value) return;

    const dy = e.clientY - startY;
    const delta = -dy;
    startY = e.clientY;

    menuItems.resizeBy(id, delta);
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    menuItemRef?.value?.previousElementSibling?.classList.remove(draggingClass);
    menuItemRef?.value?.classList.remove(draggingClass);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  watch(minHeight, (mh) => menuItems?.updateItem(id, { minHeight: mh }));

  watch(isExpanded, (open) => menuItems?.updateItem(id, { open }));

  onMounted(() => {
    const resizer = resizerRef.value;
    if (resizer) {
      resizer.addEventListener('pointerdown', onPointerDown);
      resizer.addEventListener('pointermove', onPointerMove);
      resizer.addEventListener('pointerup', onPointerUp);
      resizer.addEventListener('pointercancel', onPointerUp);
    }

    if (!menuItemRef.value || !menuItems) return;

    menuItems.registerItem({
      id,
      el: menuItemRef.value,
      minHeight: minHeight.value,
      open: isOpen.value ?? false,
    });
  });

  onBeforeUnmount(() => {
    const resizer = resizerRef.value;
    if (resizer) {
      resizer.removeEventListener('pointerdown', onPointerDown);
      resizer.removeEventListener('pointermove', onPointerMove);
      resizer.removeEventListener('pointerup', onPointerUp);
      resizer.removeEventListener('pointercancel', onPointerUp);
    }

    menuItems?.unregisterItem(id);
  });

  return {
    height,
    isOpen,
  };
}
