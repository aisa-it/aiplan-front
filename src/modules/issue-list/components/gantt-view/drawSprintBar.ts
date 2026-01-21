/*
  Функции для стилизации бара спринта
*/

import { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

function calculateSprintSegments(stats: TypesSprintStats) {
  const total = stats.all_issues || 1;

  const pct = (key: keyof TypesSprintStats) =>
    ((stats[key] ?? 0) / total) * 100;

  return [
    {
      key: 'cancelled',
      value: pct('cancelled'),
      color: 'var(--progress-bg-error)',
    },
    {
      key: 'completed',
      value: pct('completed'),
      color: 'var(--progress-bg-success)',
    },
    {
      key: 'in_progress',
      value: pct('in_progress'),
      color: 'var(--progress-bg-primary)',
    },
    { key: 'pending', value: pct('pending'), color: 'var(--progress-bg-base)' },
  ].filter((s) => s.value > 0);
}

export function drawSprintBar(
  bar: SVGGElement,
  sprintTask: any,
  tooltip?: any,
) {
  const barRect = bar.querySelector('rect.bar');
  if (!barRect || !sprintTask.sprintStats) return;

  const svg = bar.ownerSVGElement!;
  const y = Number(barRect.getAttribute('y'));
  const height = Number(barRect.getAttribute('height'));
  const x = Number(barRect.getAttribute('x'));
  const width = Number(barRect.getAttribute('width'));

  barRect.setAttribute('fill', 'transparent');

  const clipId = ensureSprintClipPath(svg, height, width);

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('clip-path', `url(#${clipId})`);
  group.setAttribute('transform', `translate(${x}, ${y})`);

  const segments = calculateSprintSegments(sprintTask.sprintStats);

  let cursorX = 0;

  segments.forEach((segment, index) => {
    const nextX =
      index === segments.length - 1
        ? width
        : Math.round(cursorX + (segment.value / 100) * width);

    const x = Math.round(cursorX);
    const w = nextX - Math.round(cursorX);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    rect.setAttribute('x', `${x}`);
    rect.setAttribute('y', '0');
    rect.setAttribute('width', `${w}`);
    rect.setAttribute('height', `${height}`);
    rect.setAttribute('fill', segment.color);

    group.appendChild(rect);
    cursorX = nextX;
  });

  const text = bar.querySelector('text');

  if (text && text.parentNode) {
    text.parentNode.insertBefore(group, text);
  } else {
    bar.appendChild(group);
  }

  handleSprintLabelOverflow(bar, (barEl) => {
    barEl.style.cursor = 'pointer';

    barEl.addEventListener('mouseenter', () => {
      tooltip?.show({
        text: sprintTask.name,
        anchorEl: barEl as unknown as HTMLElement,
      });
    });

    barEl.addEventListener('mouseleave', () => {
      tooltip?.hide();
    });
  });

  centerSprintLabel(bar, x, width);

  return;
}

function ensureSprintClipPath(
  svg: SVGSVGElement,
  height: number,
  width: number,
) {
  const id = 'sprint-rounded-clip';

  if (svg.querySelector(`#${id}`)) return id;

  const defs =
    svg.querySelector('defs') ??
    svg.insertBefore(
      document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
      svg.firstChild,
    );

  const clipPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'clipPath',
  );
  clipPath.setAttribute('id', id);
  clipPath.setAttribute('clipPathUnits', 'userSpaceOnUse');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('rx', '4');
  rect.setAttribute('ry', '4');
  rect.setAttribute('height', `${height}`);
  rect.setAttribute('width', `${width}`);

  clipPath.appendChild(rect);
  defs.appendChild(clipPath);

  return id;
}

function centerSprintLabel(bar: SVGGElement, x: number, width: number) {
  const text = bar.querySelector('text.bar-label') as SVGTextElement | null;
  if (!text) return;

  const centerX = x + width / 2 - text.getComputedTextLength() / 2;

  text.setAttribute('x', `${centerX}`);
  text.setAttribute('text-anchor', 'middle');

  const barRect = bar.querySelector('rect.bar');
  if (barRect) {
    const y = Number(barRect.getAttribute('y'));
    const height = Number(barRect.getAttribute('height'));

    text.setAttribute('y', `${y + height / 2}`);
    text.setAttribute('dominant-baseline', 'middle');
  }
}

function handleSprintLabelOverflow(
  bar: SVGGElement,
  onOverflow: (bar: SVGGElement) => void,
) {
  const text = bar.querySelector('text.bar-label') as SVGTextElement | null;
  const barRect = bar.querySelector('rect.bar');
  if (!text || !barRect) return;

  const textLength = text.getComputedTextLength();
  const barWidth = Number(barRect.getAttribute('width'));

  if (textLength > barWidth) {
    const padding = 80;
    const ellipsisWidth = 11;

    const fullText = text.textContent ?? '';
    const availableWidth = barWidth - padding;
    const avgCharWidth = textLength / fullText.length;
    const availableForText = availableWidth - ellipsisWidth;
    const maxChars = Math.floor(availableForText / avgCharWidth);
    text.textContent = fullText.slice(0, maxChars) + '...';

    onOverflow(bar);
  }
}
