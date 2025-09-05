import { onMounted, onUnmounted, Ref } from 'vue';

const menuSet = new Set<Ref>();
let globalListener = false;

const hideAllMenus = () => {
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
    window.addEventListener('scroll', hideAllMenus);
    window.addEventListener('resize', hideAllMenus);
    globalListener = true;
  }
}

function removeGlobalListener() {
  if (typeof window !== 'undefined' && globalListener) {
    window.removeEventListener('scroll', hideAllMenus);
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
