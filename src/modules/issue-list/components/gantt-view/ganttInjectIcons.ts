import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { STATUS_ICONS } from './ganttIcons';

const ICON_SIZE = 24;
const ICON_GAP = 8;

/*
  Функция для вставки иконок статусов в бар задачи
  Иконка подбирается по группе статуса задачи
  Вставка происходит в бар задачи справа от названия статуса
*/
export function injectIcons(bar: SVGGElement, task: DtoIssue) {
  if (bar.classList.contains('sprint')) return;

  if (!task.state_detail) return;

  if (bar.querySelector('image.status-icon')) return;

  const text = bar.querySelector<SVGTextElement>('text.bar-label');
  if (!text) return;

  const iconUrl =
    STATUS_ICONS[task.state_detail.group as keyof typeof STATUS_ICONS];

  if (!iconUrl) return;

  const textX = Number(text.getAttribute('x'));
  const textY = Number(text.getAttribute('y'));

  const iconX = textX - ICON_SIZE - ICON_GAP;
  const iconY = textY - ICON_SIZE / 2;

  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');

  image.classList.add('status-icon');

  image.setAttribute('href', iconUrl);
  image.setAttribute('width', String(ICON_SIZE));
  image.setAttribute('height', String(ICON_SIZE));
  image.setAttribute('x', String(iconX));
  image.setAttribute('y', String(iconY));

  text.parentElement?.insertBefore(image, text);
}

/*
  Функция для вставки иконоки alert в бар для просроченной задачи
  Вставка происходит в бар задачи слева от названия статуса
*/
export function injectDangerIcon(bar: SVGGElement) {
  if (bar.querySelector('image.danger-icon')) return;

  const text = bar.querySelector<SVGTextElement>('text.bar-label');
  if (!text) return;

  const textX = Number(text.getAttribute('x'));
  const textY = Number(text.getAttribute('y'));

  const iconY = textY - ICON_SIZE / 2;

  const imageDanger = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'image',
  );

  imageDanger.setAttribute('class', 'danger-icon');
  imageDanger.setAttribute('href', STATUS_ICONS.overdue);
  imageDanger.setAttribute('width', `${ICON_SIZE}px`);
  imageDanger.setAttribute('height', `${ICON_SIZE}px`);
  imageDanger.setAttribute('x', `${textX + text.getBBox().width + ICON_GAP}px`);
  imageDanger.setAttribute('y', `${iconY}px`);

  text.parentElement?.appendChild(imageDanger);
}
