/*
  функция получения x координаты заданной даты
  возвращает x координату линии между текущим и следующим днем
*/
export function getXByDate(container: HTMLElement, date: Date): number {
  const el = container?.querySelector(
    `.date_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  );

  if (!el) return 0;

  return el.getBoundingClientRect().right;
}

/*
  Линия текушего дня по-умолчанию в frappe gantt ставится в центр дня
  здесь она сдвигается на линию между текущим и следующим днем
  а для обозначения текущего дня используется небольшой блок с надписью "сегодня"
*/

export function fixTodayLine(container: HTMLElement, svg: SVGSVGElement) {
  const highlight = container.querySelector(
    '.current-highlight',
  ) as HTMLElement | null;

  if (!highlight) return;

  const x = getXByDate(container, new Date());
  highlight.style.left = `${x - svg.getBoundingClientRect().left}px`;

  const ball = container.querySelector(
    '.current-ball-highlight',
  ) as HTMLElement | null;

  if (!ball) return;

  ball.textContent = 'сегодня';
  ball.style.width = 'auto';
  ball.style.height = 'auto';
  ball.style.left = `${parseFloat(highlight.style.left) - ball.offsetWidth + 1}px`;
}
