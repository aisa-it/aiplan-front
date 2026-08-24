import { onMounted, onUnmounted, Ref } from 'vue';

const menuSet = new Set<Ref>();
let globalListener = false;

const hideAllMenus = (e: Event) => {
  const target = e.target;
  if (target instanceof Element && target.closest('.q-menu, .q-select__dialog')) {
    return;
  }
  menuSet.forEach((menuRef) => {
    if (menuRef.value && typeof menuRef.value.hide === 'function') {
      menuRef.value.hide();
    }
    if (menuRef.value && typeof menuRef.value.hidePopup === 'function') {
      menuRef.value.hidePopup();
    }
  });
};

function addGlobalListener() {
  if (typeof window !== 'undefined' && !globalListener) {
    window.addEventListener('scroll', hideAllMenus, true);
    window.addEventListener('resize', hideAllMenus);
    globalListener = true;
  }
}

function removeGlobalListener() {
  if (typeof window !== 'undefined' && globalListener) {
    window.removeEventListener('scroll', hideAllMenus, true);
    window.removeEventListener('resize', hideAllMenus);
    globalListener = false;
  }
}
export function useMenuHandler(menuRef: Ref) {
  onMounted(() => {
    menuSet.add(menuRef);
    addGlobalListener();
  });

  onUnmounted(() => {
    menuSet.delete(menuRef);
    if (menuSet.size === 0) {
      removeGlobalListener();
    }
  });
}
