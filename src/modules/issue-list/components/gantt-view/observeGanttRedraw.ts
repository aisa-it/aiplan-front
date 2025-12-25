/*
  Простой обсервер для выполнения перерисовки кастомных элементов,
  которая выполняется автоматически после перерисовки svg внутри frappe gantt
*/
export function observeGanttRedraw(
  container: HTMLElement,
  onRedraw: () => void,
) {
  const svg = container.querySelector('svg');
  if (!svg) return;

  let rafId: number | null = null;

  const observer = new MutationObserver(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }

    rafId = requestAnimationFrame(() => {
      rafId = null;
      onRedraw();
    });
  });

  observer.observe(svg, {
    childList: true,
    subtree: true,
  });

  return observer;
}
