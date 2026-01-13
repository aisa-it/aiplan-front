/*
  Функция для драг-скрола внутри диаграммы
*/
export function enableDragScroll(container: HTMLElement) {
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;

    isDragging = true;
    startX = e.pageX;
    scrollLeft = container.scrollLeft;

    container.classList.add('dragging');
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.pageX - startX;
    container.scrollLeft = scrollLeft - dx;
  };

  const stopDragging = () => {
    isDragging = false;
    container.classList.remove('dragging');
  };

  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseup', stopDragging);
  container.addEventListener('mouseleave', stopDragging);

  return () => {
    container.removeEventListener('mousedown', onMouseDown);
    container.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseup', stopDragging);
    container.removeEventListener('mouseleave', stopDragging);
  };
}
