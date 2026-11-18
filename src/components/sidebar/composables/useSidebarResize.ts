import { onBeforeUnmount, ref, type Ref } from 'vue';
import type { SidebarSectionId } from './useSidebarPreferences';

export function useSidebarResize(
  sidebarWidth: Ref<number>,
  viewportWidth: Ref<number>,
  weights: Ref<Record<SidebarSectionId, number>>,
) {
  const isWidthResizing = ref(false);
  const isHeightResizing = ref(false);
  let activeResizeCleanup: (() => void) | null = null;
  let widthResizeRaf: number | null = null;

  function startWidthResize(event: PointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    activeResizeCleanup?.();
    if (widthResizeRaf !== null) cancelAnimationFrame(widthResizeRaf);
    widthResizeRaf = null;
    isWidthResizing.value = true;
    const startX = event.clientX;
    const startWidth = sidebarWidth.value;
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    let targetWidth = startWidth;
    let pointerDown = true;
    const animate = () => {
      const difference = targetWidth - sidebarWidth.value;
      if (Math.abs(difference) < 0.5) {
        sidebarWidth.value = targetWidth;
        widthResizeRaf = null;
        if (!pointerDown) isWidthResizing.value = false;
        return;
      }
      sidebarWidth.value += difference * 0.22;
      widthResizeRaf = requestAnimationFrame(animate);
    };
    const schedule = () => {
      if (widthResizeRaf === null)
        widthResizeRaf = requestAnimationFrame(animate);
    };
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      targetWidth = Math.max(
        300,
        Math.min(
          viewportWidth.value / 2,
          Math.round(startWidth + next.clientX - startX),
        ),
      );
      schedule();
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      if (handle.hasPointerCapture(event.pointerId))
        handle.releasePointerCapture(event.pointerId);
      activeResizeCleanup = null;
    };
    const end = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      pointerDown = false;
      cleanup();
      if (widthResizeRaf === null) isWidthResizing.value = false;
    };
    activeResizeCleanup = () => {
      pointerDown = false;
      cleanup();
      if (widthResizeRaf !== null) cancelAnimationFrame(widthResizeRaf);
      widthResizeRaf = null;
      isWidthResizing.value = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  function startHeightResize(
    event: PointerEvent,
    current: SidebarSectionId,
    previous: SidebarSectionId,
  ) {
    if (event.button !== 0) return;
    event.preventDefault();
    activeResizeCleanup?.();
    const section = (event.currentTarget as HTMLElement).closest<HTMLElement>(
      '[data-sidebar-section]',
    );
    const previousSection =
      section?.previousElementSibling as HTMLElement | null;
    if (!section || !previousSection) return;
    const currentHeight = section.getBoundingClientRect().height;
    const previousHeight = previousSection.getBoundingClientRect().height;
    const totalHeight = currentHeight + previousHeight;
    if (totalHeight <= 600) return;
    isHeightResizing.value = true;
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    const totalWeight = weights.value[current] + weights.value[previous];
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      const previousTargetHeight = Math.max(
        300,
        Math.min(totalHeight - 300, previousHeight + next.clientY - startY),
      );
      weights.value[previous] =
        (totalWeight * previousTargetHeight) / totalHeight;
      weights.value[current] = totalWeight - weights.value[previous];
    };
    const cleanup = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      if (handle.hasPointerCapture(event.pointerId))
        handle.releasePointerCapture(event.pointerId);
      activeResizeCleanup = null;
    };
    const end = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return;
      cleanup();
      isHeightResizing.value = false;
    };
    activeResizeCleanup = () => {
      cleanup();
      isHeightResizing.value = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  onBeforeUnmount(() => {
    activeResizeCleanup?.();
    if (widthResizeRaf !== null) cancelAnimationFrame(widthResizeRaf);
  });

  return {
    isWidthResizing,
    isHeightResizing,
    startWidthResize,
    startHeightResize,
  };
}
