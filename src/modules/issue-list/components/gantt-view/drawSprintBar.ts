export function drawSprintBar(bar: SVGGElement) {
  const barRect = bar.querySelector('rect.bar');
  if (!barRect) return;

  const barY = Number(barRect.getAttribute('y'));
  const barHeight = Number(barRect.getAttribute('height'));
  const barX = Number(barRect.getAttribute('x'));
  const barWidth = Number(barRect.getAttribute('width'));

  const underline = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect',
  );
  underline.setAttribute('class', 'sprint-underline');
  underline.setAttribute('x', `${barX}`);
  underline.setAttribute('y', `${barY + barHeight - 2}`);
  underline.setAttribute('width', `${barWidth}`);
  underline.setAttribute('height', '4');
  underline.setAttribute('rx', '2');
  underline.setAttribute('fill', '#7CB342');

  bar.appendChild(underline);
  return;
}
