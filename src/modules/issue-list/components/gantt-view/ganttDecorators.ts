import { isOverdue } from './ganttDates';
import { injectIcons, injectDangerIcon } from './ganttInjectIcons';
import { drawTargetDateLine } from './drawTargetDateLine';
import { drawSprintBar } from './drawSprintBar';
import { drawOverdueSegment } from './drawOverdueSegment';
import { highlightWeekendInHeader } from './highlightWeekendInHeader';
import { fixTodayLine } from './ganttCoords';

/*
  Основная функция для отрисовки всех кастомных элементов
  настраивает выходные дни, линию текущего дня,
  проходит по всем барам и настраивает их
*/

export function decorateBars(container: HTMLElement, tasks: any[]) {
  highlightWeekendInHeader(container);

  const svg = container.querySelector('svg');
  if (!svg) return;

  fixTodayLine(container, svg);

  const bars = svg.querySelectorAll<SVGGElement>('g.bar-wrapper');

  bars.forEach((bar) => {
    shiftBars(bar, -6);

    if (bar.classList.contains('sprint')) {
      drawSprintBar(bar);
      return;
    }

    const id = bar.getAttribute('data-id');
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    injectIcons(bar, task);
    drawTargetDateLine(container, svg, bar, task);

    if (isOverdue(task)) {
      drawOverdueSegment(container, svg, bar, task);
      injectDangerIcon(bar);
    }
  });
}

/*
  бары в frappe gantt имеют небольшую погрешность относительно линий дней
  поэтому их все нужно немного сдвигать
  dataset.shifted нужен для того, чтобы не было повторных сдвигов при перерендере
*/
function shiftBars(bar: SVGGElement, shift: number) {
  if (bar.dataset.shifted === '1') return;
  bar.dataset.shifted = '1';

  const barOverlay = bar.querySelector('.bar');
  const barProgress = bar.querySelector('.bar-progress');

  [barOverlay, barProgress].forEach((el) => {
    if (!el) return;
    const x = Number(el.getAttribute('x'));
    el.setAttribute('x', String(x + shift));
  });
}
