import { Platform } from 'quasar';
import { ref, onBeforeUnmount, Ref, computed, watch } from 'vue';

export function useResizeObserverSelect(target: Ref) {
  const selectWidth = ref(0);


  const observer = new ResizeObserver(() => {
    if (target.value && target.value.$el) {
      const element = target.value.$el;
      const width = element.getBoundingClientRect().width || target.value.$el.offsetWidth;

      if (selectWidth.value !== width) {
        selectWidth.value = width;
      }
    }
  });

  const getWidthStyle = computed<string>(() => {
    if (
      target.value?.behavior === 'dialog' ||
      (target.value?.behavior === 'default' && Platform.is.mobile)
    ) {
      return 'width: 100%;';
    }

    return selectWidth.value? `width: ${selectWidth.value}px !important;` : '';
  });


  watch(
    target,
    (newValue) => {
      if(newValue && newValue.$el) {
        observer.observe(newValue.$el);
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    observer.disconnect();
  });

  return {
    getWidthStyle,
  }
}
