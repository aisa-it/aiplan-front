import { onScopeDispose, ref, type Ref } from 'vue';

export function useGanttSplitter(
  container: Ref<HTMLElement | null>,
  scrollbar: Ref<HTMLElement | null>,
) {
  const split = ref(50);
  let pointer: { id: number; start: number; ratio: number } | undefined;
  let pending = split.value;
  let frame: number | undefined;

  function setSplit(value: number) {
    split.value = Math.max(0, Math.min(100, value));
  }

  function start(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary || !(event.currentTarget instanceof HTMLElement)) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, start: event.clientX, ratio: split.value };
  }

  function move(event: PointerEvent) {
    if (pointer?.id !== event.pointerId || !container.value?.clientWidth) return;
    const width = Math.max(1, container.value.clientWidth - (scrollbar.value?.offsetWidth ?? 0) - 8);
    pending = pointer.ratio + (event.clientX - pointer.start) * 100 / width;
    frame ??= requestAnimationFrame(() => {
      frame = undefined;
      setSplit(pending);
    });
  }

  function stop(event: PointerEvent) {
    if (event.pointerId === pointer?.id) pointer = undefined;
  }

  function keydown(event: KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowLeft: split.value - 5,
      ArrowRight: split.value + 5,
      Home: 0,
      End: 100,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSplit(next);
  }

  onScopeDispose(() => {
    if (frame !== undefined) cancelAnimationFrame(frame);
  });

  return { split, start, move, stop, keydown };
}
