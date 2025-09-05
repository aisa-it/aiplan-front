import { DirectiveBinding } from 'vue';

export default {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    const classPrevent = '.' + binding.arg || '';
    const isAutoSave = binding.value.isAutoSave;
    let isDragging = false;

    const clickOutsideEvent = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (isDragging) {
        return;
      }

      if (!(el === target || el.contains(target))) {
        const isClickInsideExcludedElement = target.closest(classPrevent);
        if (!isClickInsideExcludedElement) {
          binding.value.onClickOutside(event);
          return;
        }
      }
    };

    // для мыши или сенсорных устройств при выделениях
    const onDown = () => {
      isDragging = false;
    };

    const onMove = () => {
      isDragging = true;
    };

    const onUp = () => {
      setTimeout(() => { isDragging = false; }, 0);
    };

    if (!isAutoSave) return;

    el.clickOutsideEvent = clickOutsideEvent;
    el.onDown = onDown;
    el.onMove = onMove;
    el.onUp = onUp;

    document.addEventListener('click', clickOutsideEvent);
    document.addEventListener('touchstart', clickOutsideEvent);

    // События для мыши
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    // События для сенсорных устройств
    document.addEventListener('touchstart', onDown);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
  },

  unmounted(el: HTMLElement) {
    if (!el.clickOutsideEvent) return

    document.removeEventListener('click', el.clickOutsideEvent);
    document.removeEventListener('touchstart', el.clickOutsideEvent);

    // Удаление обработчиков для мыши
    document.removeEventListener('mousedown', el.onDown);
    document.removeEventListener('mousemove', el.onMove);
    document.removeEventListener('mouseup', el.onUp);

    // Удаление обработчиков для сенсорных устройств
    document.removeEventListener('touchstart', el.onDown);
    document.removeEventListener('touchmove', el.onMove);
    document.removeEventListener('touchend', el.onUp);
  },
};
