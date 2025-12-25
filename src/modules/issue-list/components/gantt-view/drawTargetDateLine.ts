import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getXByDate } from './ganttCoords';

/*
  Функция для отрисовки пунктирной линии, обозначающей срок задачи
  Если задача не имеет срока или она отменена, линия не рисуется
*/
export function drawTargetDateLine(
  container: HTMLElement,
  svg: SVGSVGElement,
  bar: SVGGElement,
  task: DtoIssue,
) {
  if (!task.target_date) return;
  if (task.state_detail?.group === 'cancelled') return;

  if (bar.querySelector('.target-date-line')) return;

  const barRect = bar.querySelector<SVGRectElement>('rect.bar');

  if (!barRect) return;

  const barY = Number(barRect.getAttribute('y'));
  const barHeight = Number(barRect.getAttribute('height'));

  const x =
    getXByDate(container, new Date(task.target_date)) -
    svg.getBoundingClientRect().left;

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

  line.setAttribute('class', 'target-date-line');
  line.setAttribute('x1', `${x}`);
  line.setAttribute('x2', `${x}`);
  line.setAttribute('y1', `${barY - 12.5}`);
  line.setAttribute('y2', `${barY + barHeight + 12.5}`);

  bar.appendChild(line);
}
