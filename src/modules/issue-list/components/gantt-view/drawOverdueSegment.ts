import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getXByDate } from './ganttCoords';

export function drawOverdueSegment(
  container: HTMLElement,
  svg: SVGSVGElement,
  bar: SVGGElement,
  task: DtoIssue,
) {
  if (!task.target_date) return;
  if (task.state_detail?.group === 'cancelled') return;

  const barRect = bar.querySelector<SVGRectElement>('rect.bar');
  if (!barRect) return;

  const targetLine = bar.querySelector<SVGLineElement>('.target-date-line');
  if (!targetLine) return;

  const startX = Number(targetLine.getAttribute('x1'));

  let endX: number | null = null;

  if (task.completed_at) {
    endX =
      getXByDate(container, new Date(task.completed_at)) -
      svg.getBoundingClientRect().left;
  } else {
    const currentHighlight = container.querySelector(
      '.current-highlight',
    ) as HTMLElement | null;

    if (!currentHighlight) return;

    endX =
      currentHighlight.getBoundingClientRect().left -
      svg.getBoundingClientRect().left;
  }

  if (endX === null) return;

  if (endX <= startX) return;

  const barY = Number(barRect.getAttribute('y'));
  const barHeight = Number(barRect.getAttribute('height'));

  const existing = bar.querySelector('.bar-overdue');
  if (existing) existing.remove();

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  rect.setAttribute('class', 'bar-overdue');
  rect.setAttribute('x', `${startX}`);
  rect.setAttribute('y', `${barY}`);
  rect.setAttribute('width', `${endX - startX}`);
  rect.setAttribute('height', `${barHeight}`);
  rect.setAttribute('rx', '4');

  bar.appendChild(rect);
}
