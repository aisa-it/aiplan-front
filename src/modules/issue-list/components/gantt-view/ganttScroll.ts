/*
  Функция для автоскрола при появлении диаграммы
  В зависимости от контекста диаграммы, она перемещает либо на спринт,
  либо к линии текущего дня
*/
export function scrollToTarget(
  container: HTMLElement,
  selector: '.current-highlight' | '.sprint',
) {
  const target = container.querySelector(selector) as HTMLElement | null;
  if (!target) return;

  const cRect = container.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();

  container.scrollTo({
    left:
      tRect.left -
      cRect.left +
      container.scrollLeft -
      (selector === '.current-highlight' ? container.clientWidth / 2 : 100),
  });
}
