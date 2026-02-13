import { computed, nextTick, onBeforeUnmount, type Ref, ref, watch } from 'vue';
import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';

/**
 * Composable для горизонтальной прокрутки контейнера со стрелками навигации.
 * Инкапсулирует логику ScrollManager и mouseWheelScrollHandler.
 *
 * @param container - ref на HTML-элемент контейнера для прокрутки
 * @param contentLength - ref/computed с количеством элементов (для автообновления стрелок)
 */
export function useHorizontalScroll(
  container: Ref<HTMLElement | undefined>,
  contentLength?: Ref<number>,
) {
  const manager = ref<ScrollManager | null>(null);

  const showLeftArrow = computed(
    () => manager.value?.scrollState.showLeftArrow ?? false,
  );
  const showRightArrow = computed(
    () => manager.value?.scrollState.showRightArrow ?? false,
  );

  const scroll = (direction: number) => {
    manager.value?.scroll(direction);
  };

  const updateScrollState = () => {
    manager.value?.updateBtnVisible();
    if (showLeftArrow.value || showRightArrow.value) {
      mouseWheelScrollHandler(container.value ?? null, false);
    } else if (container.value) {
      container.value.onwheel = null;
    }
  };

  const init = () => {
    if (!container.value) return;
    manager.value = new ScrollManager(container.value, false);
    updateScrollState();
  };

  if (contentLength) {
    watch(contentLength, () => nextTick(updateScrollState));
  }

  onBeforeUnmount(() => {
    manager.value?.removeResize();
  });

  return {
    showLeftArrow,
    showRightArrow,
    scroll,
    updateScrollState,
    init,
  };
}
